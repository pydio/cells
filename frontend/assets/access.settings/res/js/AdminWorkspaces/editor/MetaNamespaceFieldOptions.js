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
  backgroundColor: '#f6f6f8',
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
          paddingLeft: '8px',
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
            borderColor: theme.colors.blue[6],
          },
        },
        label: {
          fontSize: theme.fontSizes.sm,
          color: theme.colors.dark[7],
        },
      }),
    },
    other: {
    formBackground: '#f6f6f8',
  },
  },
});
const FIELD_TYPES_WITH_SCHEMA_PROPERTIES = ["string", "textarea", "integer", "tag_cloud", "choice"];
const MetaNamespaceFieldOptions = forwardRef(({ ns, fieldType, tagValues }, ref) => {
  const [metaSchema, setSchema] = useState({});
  const [formData, setFormData] = useState({});
  const hasValidNs = ns && ns.JsonSchema;
  const uiSchema = {
    required: {
      "ui:widget": "hidden"
    }
  };


  const metaType = fieldType;
  if(!FIELD_TYPES_WITH_SCHEMA_PROPERTIES.includes(metaType)) {
    return null;
  }
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
      
      if (metaType && FIELD_TYPES_WITH_SCHEMA_PROPERTIES.includes(metaType)) {
        withOps = Object.entries(formData)
          .filter(([k]) => k !== "required")
          .map(([k, v]) => ({
            op: "add",
            path: `/properties/${ns.Namespace}/${k}`,
            value: v
          }));
      }
      
      if (metaType === 'tag_cloud' && Array.isArray(tagValues) && tagValues.length > 0) {        
        withOps.push({
          op:  'add',
          path: `/properties/${ns.Namespace}/items`,
          value: {
            type: 'string',
            enum: tagValues,
          }
        });
      }

      if (metaType === 'choice') {
        const vals = tagValues.map(v => v.value);
        withOps.push({
          op:  'add',
          path: `/properties/${ns.Namespace}/items`,
          value: {
            type: 'string',
            enum: vals,
          }
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
      
      try {
        ajv.compile(patchedSchema);
      } catch (e) {
        console.error("Invalid patched schema:", e);
      }
      

      return IdmUserMetaNamespace.constructFromObject({
        ...ns,
        JsonSchema: ns.JsonSchema,
      });
    }
  }), [ns, formData, metaType, tagValues]);

  if (!hasValidNs) return null;

  const handleChange = ({ formData: newFormData }) => {
    setFormData(newFormData);
  };

  return (
    <React.Fragment>
      <p style={{
        marginTop: '10px',
        fontWeight: '500',
        fontSize: '12px',
      }}>Field Validation</p>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <div style={{ 
          backgroundColor: 'rgb(246 246 248)', 
          padding: '20px', 
          borderRadius: '4px 4px 0px 0px',
          marginTop: '10px'
        }}>
        <Form
          schema={metaSchema}
          uiSchema={uiSchema}
          validator={validator}
          formData={formData}
          onChange={handleChange}
        >
          
          <React.Fragment />
        </Form>
        </div>
      </MantineProvider>
    </React.Fragment>
  );
});

MetaNamespaceFieldOptions.PropTypes = {
  ns: PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
  fieldType: PropTypes.string.isRequired,
};

export default MetaNamespaceFieldOptions;