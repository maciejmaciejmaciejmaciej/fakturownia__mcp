import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";
import { handleClientsMethods } from "./lib/fakturownia-clients";

// Environment variables for Fakturownia
const DEFAULT_DOMAIN = process.env.FAKTUROWNIA_DOMAIN || "";
const DEFAULT_API_TOKEN = process.env.FAKTUROWNIA_API_TOKEN || "";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Handle GET request with server info
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        name: "Fakturownia Clients MCP Server",
        version: "1.0.0",
        status: "running",
        description: "MCP Server for Fakturownia.pl - Clients Only",
        supportedMethods: [
          "fakt_get_clients",
          "fakt_get_client", 
          "fakt_create_client",
          "fakt_update_client",
          "fakt_delete_client"
        ]
      }),
    };
  }

  try {
    // Parse JSON-RPC request
    const request: JsonRpcRequest = JSON.parse(event.body || "{}");

    // Handle tools/list method
    if (request.method === "tools/list") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools: [
              {
                name: "fakt_get_clients",
                description: "Get list of clients from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number", description: "Page number" },
                    perPage: { type: "number", description: "Items per page" }
                  }
                }
              },
              {
                name: "fakt_get_client",
                description: "Get a specific client by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    clientId: { type: "number", description: "Client ID", required: true }
                  },
                  required: ["clientId"]
                }
              },
              {
                name: "fakt_create_client",
                description: "Create a new client",
                inputSchema: {
                  type: "object",
                  properties: {
                    clientData: { type: "object", description: "Client data", required: true }
                  },
                  required: ["clientData"]
                }
              },
              {
                name: "fakt_update_client",
                description: "Update an existing client",
                inputSchema: {
                  type: "object",
                  properties: {
                    clientId: { type: "number", description: "Client ID", required: true },
                    clientData: { type: "object", description: "Updated client data", required: true }
                  },
                  required: ["clientId", "clientData"]
                }
              },
              {
                name: "fakt_delete_client",
                description: "Delete a client",
                inputSchema: {
                  type: "object",
                  properties: {
                    clientId: { type: "number", description: "Client ID", required: true }
                  },
                  required: ["clientId"]
                }
              }
            ]
          }
        }),
      };
    }

    // Handle tools/call method
    if (request.method === "tools/call") {
      const toolName = request.params?.name;
      const toolArguments = request.params?.arguments || {};

      try {
        // Get domain and API token
        const domain = DEFAULT_DOMAIN || toolArguments.domain;
        const apiToken = DEFAULT_API_TOKEN || toolArguments.api_token;
        
        if (!domain || !apiToken) {
          throw new Error("Domain and API token are required");
        }

        const baseURL = `https://${domain}.fakturownia.pl`;

        // Create Fakturownia API client
        const client = axios.create({
          baseURL,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const fakturowniaClient = { client, apiToken };
        
        const result = await handleClientsMethods(toolName, toolArguments, fakturowniaClient);
        
        if (result === null) {
          throw new Error(`Clients method not supported: ${toolName}`);
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
          }),
        };
      } catch (error) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32000,
              message: error instanceof Error ? error.message : String(error),
            },
          }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Only tools/call method is supported for clients endpoint"
      }),
    };
  } catch (error: unknown) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : String(error),
        },
      }),
    };
  }
};
