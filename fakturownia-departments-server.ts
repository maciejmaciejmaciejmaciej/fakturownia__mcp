import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";
import { handleDepartmentsMethods } from "./lib/fakturownia-departments";

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
        name: "Fakturownia Departments MCP Server",
        version: "1.0.0",
        status: "running",
        description: "MCP Server for Fakturownia.pl - Departments Only",
        supportedMethods: [
          "fakt_get_departments",
          "fakt_get_department", 
          "fakt_create_department",
          "fakt_update_department",
          "fakt_delete_department"
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
                name: "fakt_get_departments",
                description: "Get list of departments from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number", description: "Page number" },
                    perPage: { type: "number", description: "Items per page" }
                  }
                }
              },
              {
                name: "fakt_get_department",
                description: "Get a specific department by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    departmentId: { type: "number", description: "Department ID", required: true }
                  },
                  required: ["departmentId"]
                }
              },
              {
                name: "fakt_create_department",
                description: "Create a new department",
                inputSchema: {
                  type: "object",
                  properties: {
                    departmentData: { type: "object", description: "Department data", required: true }
                  },
                  required: ["departmentData"]
                }
              },
              {
                name: "fakt_update_department",
                description: "Update an existing department",
                inputSchema: {
                  type: "object",
                  properties: {
                    departmentId: { type: "number", description: "Department ID", required: true },
                    departmentData: { type: "object", description: "Updated department data", required: true }
                  },
                  required: ["departmentId", "departmentData"]
                }
              },
              {
                name: "fakt_delete_department",
                description: "Delete a department",
                inputSchema: {
                  type: "object",
                  properties: {
                    departmentId: { type: "number", description: "Department ID", required: true }
                  },
                  required: ["departmentId"]
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
        
        const result = await handleDepartmentsMethods(toolName, toolArguments, fakturowniaClient);
        
        if (result === null) {
          throw new Error(`Departments method not supported: ${toolName}`);
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
        error: "Only tools/call method is supported for departments endpoint"
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
