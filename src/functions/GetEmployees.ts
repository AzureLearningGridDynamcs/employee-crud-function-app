import { CosmosClient } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

import 'dotenv/config'

const LOG_PREFIX = '[GetEmployees] -> ';

export async function GetEmployees(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    const cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT;
    const cosmosKey = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_ID;
    const containerId = process.env.CONTAINER_ID;

    if (!cosmosEndpoint || !cosmosKey || !databaseId || !containerId) {
        context.error(LOG_PREFIX + 'Missing environment variables for Cosmos DB connection');
        context.error(LOG_PREFIX + `cosmosEndpoint: ${cosmosEndpoint}, cosmosKey: ${cosmosKey}, databaseId: ${databaseId}, containerId: ${containerId}`);
        return { status: 500, body: 'Error obtaining credentials During Execution Time' };
    }

    try {
        const client = new CosmosClient({ endpoint: cosmosEndpoint!, key: cosmosKey! });
        const container = client.database(databaseId).container(containerId);

        const employees = await container.items.query("SELECT * FROM c").fetchAll();

        // map employees array to only Display id, name and Company id
        const employeesRepsonse = employees.resources.map(employee => ({
            id: employee.id,
            name: employee.name,
            companyId: employee.companyId
        }));

        return {
            status: 200,
            body: JSON.stringify(employeesRepsonse),
            headers: { "Content-Type": "application/json" }
        };
        
    } catch (error) {
        context.error(LOG_PREFIX + 'Error creating CosmosClient:', error);
        return { status: 500, body: 'Error Conencting to DB ' + `: ${error.message}` };
    }
};

app.http('getEmployees', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetEmployees
});

