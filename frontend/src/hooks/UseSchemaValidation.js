// hooks/useSchemaValidation.js
import { useState, useEffect } from 'react';
import Ajv from 'ajv';
import { getSchema } from "../api/OpenApi";

const useSchemaValidation = (schemaName, data) => {
    const [errors, setErrors] = useState({});
    const [schema, setSchema] = useState(null);
    const ajv = new Ajv();

    // Custom format handler for int64
    ajv.addFormat('int64', {
        type: 'number',
        validate: (x) => Number.isInteger(x)
    });

    // Custom format handler for int32
    ajv.addFormat('int32', {
        type: 'number',
        validate: (x) => Number.isInteger(x)
    });

    useEffect(() => {
        // Fetch the schema when the hook is initialized
        getSchema(schemaName).then(r => {
            setSchema(r);
        });
    }, [schemaName]);

    const validate = () => {
        if (!schema) return false; // If schema is not loaded yet, do not validate

        const validateFunction = ajv.compile(schema);
        const valid = validateFunction(data);

        if (!valid) {
            const newErrors = {};
            validateFunction.errors.forEach(error => {
                const field = error.instancePath ? error.instancePath.replace('/', '') : 'unknown';
                newErrors[field] = error.message;
            });
            console.log(newErrors);
            setErrors(newErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    return { errors, validate };
};

export default useSchemaValidation;
