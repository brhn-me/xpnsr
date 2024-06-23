import Swagger from 'swagger-client';

const API_DOC_URL = '/v3/api-docs';

export const getApiDoc = async () => {
    try {
        const client = await Swagger(API_DOC_URL);
        return client.spec;
    } catch (error) {
        console.error('Error fetching API documentation:', error);
        throw error;
    }
};

export const getSchema = async (schemaName) => {
    try {
        const apiDoc = await getApiDoc();
        return apiDoc.components.schemas[schemaName];
    } catch (error) {
        console.error(`Error fetching schema ${schemaName}:`, error);
        throw error;
    }
};
