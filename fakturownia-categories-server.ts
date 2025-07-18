import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";
import { handleCategoriesMethods } from "./lib/fakturownia-categories";

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
        name: "Fakturownia Categories MCP Server",
        version: "1.0.0",
        status: "running",
        description: "MCP Server for Fakturownia.pl - Categories Only",
        supportedMethods: [
          "fakt_get_categories",
          "fakt_get_category", 
          "fakt_create_category",
          "fakt_update_category",
          "fakt_delete_category"
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
                name: "fakt_get_categories",
                description: "Get list of categories from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number", description: "Page number" },
                    perPage: { type: "number", description: "Items per page" }
                  }
                }
              },
              {
                name: "fakt_get_category",
                description: "Get a specific category by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    categoryId: { type: "number", description: "Category ID", required: true }
                  },
                  required: ["categoryId"]
                }
              },
              {
                name: "fakt_create_category",
                description: "Create a new category",
                inputSchema: {
                  type: "object",
                  properties: {
                    categoryData: { type: "object", description: "Category data", required: true }
                  },
                  required: ["categoryData"]
                }
              },
              {
                name: "fakt_update_category",
                description: "Update an existing category",
                inputSchema: {
                  type: "object",
                  properties: {
                    categoryId: { type: "number", description: "Category ID", required: true },
                    categoryData: { type: "object", description: "Updated category data", required: true }
                  },
                  required: ["categoryId", "categoryData"]
                }
              },
              {
                name: "fakt_delete_category",
                description: "Delete a category",
                inputSchema: {
                  type: "object",
                  properties: {
                    categoryId: { type: "number", description: "Category ID", required: true }
                  },
                  required: ["categoryId"]
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
        
        const result = await handleCategoriesMethods(toolName, toolArguments, fakturowniaClient);
        
        if (result === null) {
          throw new Error(`Categories method not supported: ${toolName}`);
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
        error: "Only tools/call method is supported for categories endpoint"
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
