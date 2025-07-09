import { CosmosClient } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

import 'dotenv/config'

export async function
    GetEmployees(request: HttpRequest, context: InvocationContext):
    Promise<HttpResponseInit> {

    context.log(`Http function processed request for url "${request.url}"`);

    const cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT;
    const cosmosKey = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_ID;
    const containerId = process.env.CONTAINER_ID;


    try {
        const client = new CosmosClient({ endpoint: cosmosEndpoint!, key: cosmosKey! });
        const container = client.database(databaseId).container(containerId);

        const { resources: employees } = await container.items.query("SELECT * FROM c").fetchAll();

        return {
            status: 200,
            body: JSON.stringify(employees),
            headers: { "Content-Type": "application/json" }
        };
        
    } catch (error) {
        context.error('Error creating CosmosClient:', error);
        return { status: 500, body: 'Internal Server Error' };
    }
};

app.http('getEmployees', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetEmployees
});

