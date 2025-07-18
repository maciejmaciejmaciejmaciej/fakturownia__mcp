import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";
import { handleInvoicesMethods } from "./lib/fakturownia-invoices";

// Environment variables for Fakturownia
const DEFAULT_DOMAIN = process.env.FAKTUROWNIA_DOMAIN || "";
const DEFAULT_API_TOKEN = process.env.FAKTUROWNIA_API_TOKEN || "";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

async function handleFakturowniaInvoicesRequest(
  method: string,
  params: any
): Promise<any> {
  // Get domain and API token
  const domain = DEFAULT_DOMAIN || params.domain;
  const apiToken = DEFAULT_API_TOKEN || params.api_token;

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
  
  // Only handle invoice methods
  const result = await handleInvoicesMethods(method, params, fakturowniaClient);
  
  if (result === null) {
    throw new Error(`Invoice method not supported: ${method}`);
  }
  
  return result;
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
        name: "Fakturownia Invoices MCP Server",
        version: "1.0.0",
        status: "running",
        description: "MCP Server for Fakturownia.pl - Invoices Only",
        endpoints: {
          mcp: "/.netlify/functions/fakturownia-invoices (POST with MCP protocol)",
          direct: "/.netlify/functions/fakturownia-invoices (POST with direct API calls)"
        },
        supportedMethods: [
          "fakt_get_invoices",
          "fakt_get_invoice", 
          "fakt_create_invoice",
          "fakt_update_invoice",
          "fakt_delete_invoice",
          "fakt_send_invoice_by_email",
          "fakt_change_invoice_status",
          "fakt_get_invoice_pdf"
        ]
      }),
    };
  }

  try {
    // Parse JSON-RPC request
    const request: JsonRpcRequest = JSON.parse(event.body || "{}");

    // Handle initialize method
    if (request.method === "initialize") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "Fakturownia Invoices MCP Server",
              version: "1.0.0",
            },
          },
        }),
      };
    }

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
                name: "fakt_get_invoices",
                description: "Get list of invoices from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number", description: "Page number" },
                    perPage: { type: "number", description: "Items per page" },
                    period: { type: "string", description: "Time period filter" },
                    includePositions: { type: "boolean", description: "Include invoice positions" }
                  }
                }
              },
              {
                name: "fakt_get_invoice",
                description: "Get a specific invoice by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true }
                  },
                  required: ["invoiceId"]
                }
              },
              {
                name: "fakt_create_invoice",
                description: "Create a new invoice",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceData: { type: "object", description: "Invoice data", required: true }
                  },
                  required: ["invoiceData"]
                }
              },
              {
                name: "fakt_update_invoice",
                description: "Update an existing invoice",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true },
                    invoiceData: { type: "object", description: "Updated invoice data", required: true }
                  },
                  required: ["invoiceId", "invoiceData"]
                }
              },
              {
                name: "fakt_delete_invoice",
                description: "Delete an invoice",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true }
                  },
                  required: ["invoiceId"]
                }
              },
              {
                name: "fakt_send_invoice_by_email",
                description: "Send invoice by email",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true },
                    emailTo: { type: "string", description: "Recipient email" },
                    emailCc: { type: "string", description: "CC email" },
                    emailPdf: { type: "boolean", description: "Include PDF attachment" }
                  },
                  required: ["invoiceId"]
                }
              },
              {
                name: "fakt_change_invoice_status",
                description: "Change invoice status",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true },
                    status: { type: "string", description: "New status", required: true }
                  },
                  required: ["invoiceId", "status"]
                }
              },
              {
                name: "fakt_get_invoice_pdf",
                description: "Get invoice as PDF",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number", description: "Invoice ID", required: true }
                  },
                  required: ["invoiceId"]
                }
              }
            ]
          }
        }),
      };
    }

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
        
        const result = await handleInvoicesMethods(toolName, toolArguments, fakturowniaClient);
        
        if (result === null) {
          throw new Error(`Invoice method not supported: ${toolName}`);
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

    // Handle direct Fakturownia requests (for backwards compatibility)
    const result = await handleFakturowniaInvoicesRequest(
      request.method,
      request.params
    );

    // Return successful JSON-RPC response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result,
      }),
    };
  } catch (error: unknown) {
    // Handle parsing errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error",
          },
        }),
      };
    }

    // Handle other errors
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
