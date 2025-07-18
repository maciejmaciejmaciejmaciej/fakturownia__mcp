import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";
import { handleProductsMethods } from "./lib/fakturownia-products";

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
        name: "Fakturownia Products MCP Server",
        version: "1.0.0",
        status: "running",
        description: "MCP Server for Fakturownia.pl - Products Only",
        supportedMethods: [
          "fakt_get_products",
          "fakt_get_product", 
          "fakt_create_product",
          "fakt_update_product"
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
                name: "fakt_get_products",
                description: "Get list of products from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number", description: "Page number" },
                    perPage: { type: "number", description: "Items per page" }
                  }
                }
              },
              {
                name: "fakt_get_product",
                description: "Get a specific product by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    productId: { type: "number", description: "Product ID", required: true }
                  },
                  required: ["productId"]
                }
              },
              {
                name: "fakt_create_product",
                description: "Create a new product",
                inputSchema: {
                  type: "object",
                  properties: {
                    productData: { type: "object", description: "Product data", required: true }
                  },
                  required: ["productData"]
                }
              },
              {
                name: "fakt_update_product",
                description: "Update an existing product",
                inputSchema: {
                  type: "object",
                  properties: {
                    productId: { type: "number", description: "Product ID", required: true },
                    productData: { type: "object", description: "Updated product data", required: true }
                  },
                  required: ["productId", "productData"]
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
        
        const result = await handleProductsMethods(toolName, toolArguments, fakturowniaClient);
        
        if (result === null) {
          throw new Error(`Products method not supported: ${toolName}`);
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
        error: "Only tools/call method is supported for products endpoint"
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
