import React, { useState, useEffect } from 'react';
import Metadata from '../model/Metadata';
import { IdmUserMetaNamespace } from 'cells-sdk'
import PropTypes from 'prop-types';
import { Form } from '@rjsf/mantine';
import { MantineProvider, createTheme } from '@mantine/core';
import Ajv from 'ajv';
import ajvMergePatch from 'ajv-merge-patch'
import validator from '@rjsf/validator-ajv8';



const ajv = new Ajv();
ajvMergePatch(ajv);
const theme = createTheme({
  
});

export default function MetaNamespaceFieldOptions({ type, ns, onSave }) {
  const [metaSchema, setSchema] = useState({});
  let updateCount = 0;
  useEffect(() => {
    (async () => {
      const res = await Metadata.getMetaSchema("string")
      setSchema(res.JsonSchema || {});
    })();
  }, []);

  const handleSubmit = async ({ formData }) => {
    
    const withOps = Object.entries(formData)
      .filter(([k]) => k !== "required")
      .map(([k, v]) => ({
        op: "add",
        path: `/properties/${ns.Namespace}/${k}`,
        value: v
      }));

    if (formData.required === true) {
      withOps.push({
        op: "add",
        path: "/required",
        value: [`${ns.Namespace}`]
      });
    }
    const id = `https://schemas.pydio.com/string/patched/${updateCount}`
    const patchedSchema = {
      $id: id,
      $patch: {
        source: ns.JsonSchema,
        with: withOps,
      }
    }
    
    updateCount += 1;
    ajv.compile(patchedSchema)

    await Metadata.putNS(ns)
  };

  return (
    <React.Fragment>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <Form
          schema={metaSchema}
          validator={validator}
          onSubmit={handleSubmit}
        />
      </MantineProvider>

    </React.Fragment>
  );
}


MetaNamespaceFieldOptions.PropTypes = {
  ns: PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
  type: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};
