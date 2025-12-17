/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */


import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import '@mantine/core/styles.css';
import { IdmUserMetaNamespace } from 'cells-sdk';
import PropTypes from 'prop-types';
import { Form } from '@rjsf/mantine';
import { MantineProvider, createTheme } from '@mantine/core';
import Ajv from 'ajv';
import ajvMergePatch from 'ajv-merge-patch';
import addFormats from 'ajv-formats';
import validator from '@rjsf/validator-ajv8';
import Metadata from './../model/Metadata';
import { v4 as uuidv4 } from 'uuid';


const ajv = new Ajv();
addFormats(ajv);
ajvMergePatch(ajv);
export const theme = createTheme({
  components: {
    NumberInput: {
      styles: () => ({
        rightSection: {
          display: 'none',
        },
        controls: {
          display: 'none',
        },
        input: {
          paddingRight: '0 !important',
        },
      }),
    },
    Checkbox: {
      styles: (theme) => ({
        body: {
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        input: {
          borderColor: theme.colors.gray[5],
          '&:checked': {
            backgroundColor: theme.colors.blue[6],
            borderColor: theme.colors.blue[6],
          },
        },
        label: {
          fontSize: theme.fontSizes.sm,
          color: theme.colors.dark[7],
        },
      }),
    },
  },
});

const MetaNamespaceFieldOptions = forwardRef(({ ns, fieldType }, ref) => {
  const [metaSchema, setSchema] = useState({});
  const [formData, setFormData] = useState({});
  const hasValidNs = ns && ns.JsonSchema;

  const metaType = fieldType;
  useEffect(() => {
    
    if (!metaType) return;

    (async () => {
      const res = await Metadata.getMetaSchema(metaType);
      setSchema(res.JsonSchema || {});
    })();
  }, [metaType]);

  useEffect(() => {
    if (!hasValidNs) return;
    
    const nsProperties = ns.JsonSchema?.properties?.[ns.Namespace] || {};
    const isRequired = ns.JsonSchema?.required?.includes(ns.Namespace) || false;
    
    const initialFormData = {
        ...nsProperties,
        required: isRequired
    };
    
    setFormData(initialFormData);
}, [hasValidNs, ns]);

  useImperativeHandle(ref, () => ({
    getUpdatedNamespace: () => {
      if (!formData || Object.keys(formData).length === 0) {
        return ns;
      }

      let withOps = [];
      if (metaType && ["string", "textarea", "integer"].includes(metaType)) {
        withOps = Object.entries(formData)
          .filter(([k]) => k !== "required")
          .map(([k, v]) => ({
            op: "add",
            path: `/properties/${ns.Namespace}/${k}`,
            value: v
          }));
      }
      
      if (formData.required === true) {
        withOps.push({
          op: "add",
          path: "/required",
          value: [`${ns.Namespace}`]
        });
      } else if ((!formData.required && ns.JsonSchema.required?.length > 0) || formData.required === false) {
        withOps.push({
          op: "remove",
          path: "/required",
          value: [`${ns.Namespace}`]
        });
      }
      
      if (withOps.length === 0) {
        return ns;
      }

      const id = `https://schemas.pydio.com/string/patched/${uuidv4()}`;
      const patchedSchema = {
        $id: id,
        $patch: {
          source: ns.JsonSchema,
          with: withOps,
        }
      };
      
      
      ajv.compile(patchedSchema);
      
      return IdmUserMetaNamespace.constructFromObject({
        ...ns,
        JsonSchema: ns.JsonSchema,
      });
    }
  }), [ns, formData, metaType]);

  if (!hasValidNs) return null;

  const handleChange = ({ formData: newFormData }) => {
    setFormData(newFormData);
  };

  return (
    <React.Fragment>
      <p>Field validation</p>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <Form
          schema={metaSchema}
          validator={validator}
          formData={formData}
          onChange={handleChange}
        >
          <React.Fragment />
        </Form>
      </MantineProvider>
    </React.Fragment>
  );
});

MetaNamespaceFieldOptions.PropTypes = {
  ns: PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
  fieldType: PropTypes.string,
};

export default MetaNamespaceFieldOptions;