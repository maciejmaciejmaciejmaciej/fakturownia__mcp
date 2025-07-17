import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface FakturowniaError {
  message: string;
  code?: string;
}

type AxiosError = {
  response?: {
    data?: FakturowniaError;
  };
  message: string;
};

const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    (error as any).response !== undefined
  );
};

// Get Fakturownia credentials from environment variables
const DEFAULT_DOMAIN = process.env.FAKTUROWNIA_DOMAIN || "";
const DEFAULT_API_TOKEN = process.env.FAKTUROWNIA_API_TOKEN || "";

async function handleFakturowniaRequest(
  method: string,
  params: any
): Promise<any> {
  try {
    const domain = params.domain || DEFAULT_DOMAIN;
    const apiToken = params.apiToken || DEFAULT_API_TOKEN;

    if (!domain) {
      throw new Error(
        "Fakturownia domain not provided in environment variables or request parameters"
      );
    }

    if (!apiToken) {
      throw new Error(
        "Fakturownia API token not provided in environment variables or request parameters"
      );
    }

    // Base URL for Fakturownia API
    const baseURL = `https://${domain}.fakturownia.pl`;

    // Create Fakturownia API client
    const client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Handle Fakturownia API methods
    switch (method) {
      // INVOICES
      case "get_invoices":
        const invoicesResponse = await client.get("/invoices.json", {
          params: {
            api_token: apiToken,
            page: params.page || 1,
            per_page: params.perPage || 10,
            period: params.period || "this_month",
            include_positions: params.includePositions || false,
            ...params.filters,
          },
        });
        return invoicesResponse.data;

      case "get_invoice":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required");
        }
        const invoiceResponse = await client.get(
          `/invoices/${params.invoiceId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return invoiceResponse.data;

      case "create_invoice":
        if (!params.invoiceData) {
          throw new Error("Invoice data is required for creating an invoice");
        }
        const createInvoiceResponse = await client.post("/invoices.json", {
          api_token: apiToken,
          invoice: params.invoiceData,
        });
        return createInvoiceResponse.data;

      case "update_invoice":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required for updating an invoice");
        }
        if (!params.invoiceData) {
          throw new Error("Invoice data is required for updating an invoice");
        }
        const updateInvoiceResponse = await client.put(
          `/invoices/${params.invoiceId}.json`,
          {
            api_token: apiToken,
            invoice: params.invoiceData,
          }
        );
        return updateInvoiceResponse.data;

      case "delete_invoice":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required for deleting an invoice");
        }
        const deleteInvoiceResponse = await client.delete(
          `/invoices/${params.invoiceId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteInvoiceResponse.data;

      case "send_invoice_by_email":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required for sending by email");
        }
        const sendEmailResponse = await client.post(
          `/invoices/${params.invoiceId}/send_by_email.json`,
          {},
          {
            params: {
              api_token: apiToken,
              email_to: params.emailTo,
              email_cc: params.emailCc,
              email_pdf: params.emailPdf || true,
            },
          }
        );
        return sendEmailResponse.data;

      case "change_invoice_status":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required for changing status");
        }
        if (!params.status) {
          throw new Error("Status is required");
        }
        const statusResponse = await client.post(
          `/invoices/${params.invoiceId}/change_status.json`,
          {},
          {
            params: {
              api_token: apiToken,
              status: params.status,
            },
          }
        );
        return statusResponse.data;

      case "get_invoice_pdf":
        if (!params.invoiceId) {
          throw new Error("Invoice ID is required for getting PDF");
        }
        const pdfResponse = await client.get(
          `/invoices/${params.invoiceId}.pdf`,
          {
            params: {
              api_token: apiToken,
            },
            responseType: "arraybuffer",
          }
        );
        return {
          data: Buffer.from(pdfResponse.data).toString("base64"),
          contentType: "application/pdf",
        };

      // CLIENTS
      case "get_clients":
        const clientsResponse = await client.get("/clients.json", {
          params: {
            api_token: apiToken,
            page: params.page || 1,
            per_page: params.perPage || 10,
            name: params.name,
            email: params.email,
            tax_no: params.taxNo,
            ...params.filters,
          },
        });
        return clientsResponse.data;

      case "get_client":
        if (!params.clientId) {
          throw new Error("Client ID is required");
        }
        const clientResponse = await client.get(
          `/clients/${params.clientId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return clientResponse.data;

      case "create_client":
        if (!params.clientData) {
          throw new Error("Client data is required for creating a client");
        }
        const createClientResponse = await client.post("/clients.json", {
          api_token: apiToken,
          client: params.clientData,
        });
        return createClientResponse.data;

      case "update_client":
        if (!params.clientId) {
          throw new Error("Client ID is required for updating a client");
        }
        if (!params.clientData) {
          throw new Error("Client data is required for updating a client");
        }
        const updateClientResponse = await client.put(
          `/clients/${params.clientId}.json`,
          {
            api_token: apiToken,
            client: params.clientData,
          }
        );
        return updateClientResponse.data;

      case "delete_client":
        if (!params.clientId) {
          throw new Error("Client ID is required for deleting a client");
        }
        const deleteClientResponse = await client.delete(
          `/clients/${params.clientId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteClientResponse.data;

      // PRODUCTS
      case "get_products":
        const productsResponse = await client.get("/products.json", {
          params: {
            api_token: apiToken,
            page: params.page || 1,
            per_page: params.perPage || 10,
            warehouse_id: params.warehouseId,
            ...params.filters,
          },
        });
        return productsResponse.data;

      case "get_product":
        if (!params.productId) {
          throw new Error("Product ID is required");
        }
        const productResponse = await client.get(
          `/products/${params.productId}.json`,
          {
            params: {
              api_token: apiToken,
              warehouse_id: params.warehouseId,
            },
          }
        );
        return productResponse.data;

      case "create_product":
        if (!params.productData) {
          throw new Error("Product data is required for creating a product");
        }
        const createProductResponse = await client.post("/products.json", {
          api_token: apiToken,
          product: params.productData,
        });
        return createProductResponse.data;

      case "update_product":
        if (!params.productId) {
          throw new Error("Product ID is required for updating a product");
        }
        if (!params.productData) {
          throw new Error("Product data is required for updating a product");
        }
        const updateProductResponse = await client.put(
          `/products/${params.productId}.json`,
          {
            api_token: apiToken,
            product: params.productData,
          }
        );
        return updateProductResponse.data;

      // PAYMENTS
      case "get_payments":
        const paymentsResponse = await client.get("/banking/payments.json", {
          params: {
            api_token: apiToken,
            page: params.page || 1,
            per_page: params.perPage || 10,
            include: params.include,
            ...params.filters,
          },
        });
        return paymentsResponse.data;

      case "get_payment":
        if (!params.paymentId) {
          throw new Error("Payment ID is required");
        }
        const paymentResponse = await client.get(
          `/banking/payment/${params.paymentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return paymentResponse.data;

      case "create_payment":
        if (!params.paymentData) {
          throw new Error("Payment data is required for creating a payment");
        }
        const createPaymentResponse = await client.post(
          "/banking/payments.json",
          {
            api_token: apiToken,
            banking_payment: params.paymentData,
          }
        );
        return createPaymentResponse.data;

      case "update_payment":
        if (!params.paymentId) {
          throw new Error("Payment ID is required for updating a payment");
        }
        if (!params.paymentData) {
          throw new Error("Payment data is required for updating a payment");
        }
        const updatePaymentResponse = await client.patch(
          `/banking/payments/${params.paymentId}.json`,
          {
            api_token: apiToken,
            banking_payment: params.paymentData,
          }
        );
        return updatePaymentResponse.data;

      case "delete_payment":
        if (!params.paymentId) {
          throw new Error("Payment ID is required for deleting a payment");
        }
        const deletePaymentResponse = await client.delete(
          `/banking/payments/${params.paymentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deletePaymentResponse.data;

      // CATEGORIES
      case "get_categories":
        const categoriesResponse = await client.get("/categories.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return categoriesResponse.data;

      case "get_category":
        if (!params.categoryId) {
          throw new Error("Category ID is required");
        }
        const categoryResponse = await client.get(
          `/categories/${params.categoryId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return categoryResponse.data;

      case "create_category":
        if (!params.categoryData) {
          throw new Error("Category data is required for creating a category");
        }
        const createCategoryResponse = await client.post("/categories.json", {
          api_token: apiToken,
          category: params.categoryData,
        });
        return createCategoryResponse.data;

      case "update_category":
        if (!params.categoryId) {
          throw new Error("Category ID is required for updating a category");
        }
        if (!params.categoryData) {
          throw new Error("Category data is required for updating a category");
        }
        const updateCategoryResponse = await client.put(
          `/categories/${params.categoryId}.json`,
          {
            api_token: apiToken,
            category: params.categoryData,
          }
        );
        return updateCategoryResponse.data;

      case "delete_category":
        if (!params.categoryId) {
          throw new Error("Category ID is required for deleting a category");
        }
        const deleteCategoryResponse = await client.delete(
          `/categories/${params.categoryId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteCategoryResponse.data;

      // WAREHOUSES
      case "get_warehouses":
        const warehousesResponse = await client.get("/warehouses.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return warehousesResponse.data;

      case "get_warehouse":
        if (!params.warehouseId) {
          throw new Error("Warehouse ID is required");
        }
        const warehouseResponse = await client.get(
          `/warehouses/${params.warehouseId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return warehouseResponse.data;

      case "create_warehouse":
        if (!params.warehouseData) {
          throw new Error(
            "Warehouse data is required for creating a warehouse"
          );
        }
        const createWarehouseResponse = await client.post("/warehouses.json", {
          api_token: apiToken,
          warehouse: params.warehouseData,
        });
        return createWarehouseResponse.data;

      case "update_warehouse":
        if (!params.warehouseId) {
          throw new Error("Warehouse ID is required for updating a warehouse");
        }
        if (!params.warehouseData) {
          throw new Error(
            "Warehouse data is required for updating a warehouse"
          );
        }
        const updateWarehouseResponse = await client.put(
          `/warehouses/${params.warehouseId}.json`,
          {
            api_token: apiToken,
            warehouse: params.warehouseData,
          }
        );
        return updateWarehouseResponse.data;

      case "delete_warehouse":
        if (!params.warehouseId) {
          throw new Error("Warehouse ID is required for deleting a warehouse");
        }
        const deleteWarehouseResponse = await client.delete(
          `/warehouses/${params.warehouseId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteWarehouseResponse.data;

      // WAREHOUSE DOCUMENTS
      case "get_warehouse_documents":
        const warehouseDocsResponse = await client.get(
          "/warehouse_documents.json",
          {
            params: {
              api_token: apiToken,
              page: params.page || 1,
              per_page: params.perPage || 10,
              ...params.filters,
            },
          }
        );
        return warehouseDocsResponse.data;

      case "get_warehouse_document":
        if (!params.documentId) {
          throw new Error("Document ID is required");
        }
        const warehouseDocResponse = await client.get(
          `/warehouse_documents/${params.documentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return warehouseDocResponse.data;

      case "create_warehouse_document":
        if (!params.documentData) {
          throw new Error(
            "Document data is required for creating a warehouse document"
          );
        }
        const createWarehouseDocResponse = await client.post(
          "/warehouse_documents.json",
          {
            api_token: apiToken,
            warehouse_document: params.documentData,
          }
        );
        return createWarehouseDocResponse.data;

      case "update_warehouse_document":
        if (!params.documentId) {
          throw new Error(
            "Document ID is required for updating a warehouse document"
          );
        }
        if (!params.documentData) {
          throw new Error(
            "Document data is required for updating a warehouse document"
          );
        }
        const updateWarehouseDocResponse = await client.put(
          `/warehouse_documents/${params.documentId}.json`,
          {
            api_token: apiToken,
            warehouse_document: params.documentData,
          }
        );
        return updateWarehouseDocResponse.data;

      case "delete_warehouse_document":
        if (!params.documentId) {
          throw new Error(
            "Document ID is required for deleting a warehouse document"
          );
        }
        const deleteWarehouseDocResponse = await client.delete(
          `/warehouse_documents/${params.documentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteWarehouseDocResponse.data;

      // DEPARTMENTS
      case "get_departments":
        const departmentsResponse = await client.get("/departments.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return departmentsResponse.data;

      case "get_department":
        if (!params.departmentId) {
          throw new Error("Department ID is required");
        }
        const departmentResponse = await client.get(
          `/departments/${params.departmentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return departmentResponse.data;

      case "create_department":
        if (!params.departmentData) {
          throw new Error(
            "Department data is required for creating a department"
          );
        }
        const createDepartmentResponse = await client.post(
          "/departments.json",
          {
            api_token: apiToken,
            department: params.departmentData,
          }
        );
        return createDepartmentResponse.data;

      case "update_department":
        if (!params.departmentId) {
          throw new Error(
            "Department ID is required for updating a department"
          );
        }
        if (!params.departmentData) {
          throw new Error(
            "Department data is required for updating a department"
          );
        }
        const updateDepartmentResponse = await client.put(
          `/departments/${params.departmentId}.json`,
          {
            api_token: apiToken,
            department: params.departmentData,
          }
        );
        return updateDepartmentResponse.data;

      case "delete_department":
        if (!params.departmentId) {
          throw new Error(
            "Department ID is required for deleting a department"
          );
        }
        const deleteDepartmentResponse = await client.delete(
          `/departments/${params.departmentId}.json`,
          {
            params: {
              api_token: apiToken,
            },
          }
        );
        return deleteDepartmentResponse.data;

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
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

  // Handle GET requests for health check
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        name: "Fakturownia MCP Server",
        version: "1.0.0",
        status: "running",
        endpoints: {
          mcp: "/.netlify/functions/fakturownia-server (POST with MCP protocol)",
          direct: "/.netlify/functions/fakturownia-server (POST with JSON-RPC)",
        },
      }),
    };
  }

  // Only allow POST requests for MCP/JSON-RPC
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32601,
          message: "Method not allowed",
        },
      }),
    };
  }

  try {
    // Parse the JSON-RPC request
    const request: JsonRpcRequest = JSON.parse(event.body || "{}");

    if (request.jsonrpc !== "2.0") {
      throw new Error("Invalid JSON-RPC version");
    }

    // Handle MCP protocol methods
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
              tools: {
                listChanged: true,
              },
            },
            serverInfo: {
              name: "fakturownia-mcp-server",
              version: "1.0.0",
            },
          },
        }),
      };
    }

    if (request.method === "notifications/initialized") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {},
        }),
      };
    }

    if (request.method === "tools/list") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools: [
              // Invoices
              {
                name: "get_invoices",
                description: "Get list of invoices from Fakturownia",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    perPage: { type: "number" },
                    period: { type: "string" },
                    includePositions: { type: "boolean" },
                    filters: { type: "object" },
                  },
                },
              },
              {
                name: "get_invoice",
                description: "Get single invoice by ID",
                inputSchema: {
                  type: "object",
                  properties: { invoiceId: { type: "number" } },
                  required: ["invoiceId"],
                },
              },
              {
                name: "create_invoice",
                description: "Create new invoice",
                inputSchema: {
                  type: "object",
                  properties: { invoiceData: { type: "object" } },
                  required: ["invoiceData"],
                },
              },
              {
                name: "update_invoice",
                description: "Update existing invoice",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number" },
                    invoiceData: { type: "object" },
                  },
                  required: ["invoiceId", "invoiceData"],
                },
              },
              {
                name: "delete_invoice",
                description: "Delete invoice",
                inputSchema: {
                  type: "object",
                  properties: { invoiceId: { type: "number" } },
                  required: ["invoiceId"],
                },
              },
              {
                name: "send_invoice_by_email",
                description: "Send invoice by email to client",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number" },
                    emailTo: { type: "string" },
                    emailCc: { type: "string" },
                    emailPdf: { type: "boolean" },
                  },
                  required: ["invoiceId"],
                },
              },
              {
                name: "change_invoice_status",
                description: "Change invoice status",
                inputSchema: {
                  type: "object",
                  properties: {
                    invoiceId: { type: "number" },
                    status: { type: "string" },
                  },
                  required: ["invoiceId", "status"],
                },
              },
              {
                name: "get_invoice_pdf",
                description: "Get invoice PDF file",
                inputSchema: {
                  type: "object",
                  properties: { invoiceId: { type: "number" } },
                  required: ["invoiceId"],
                },
              },

              // Clients
              {
                name: "get_clients",
                description: "Get list of clients",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    perPage: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string" },
                    taxNo: { type: "string" },
                    filters: { type: "object" },
                  },
                },
              },
              {
                name: "get_client",
                description: "Get single client by ID",
                inputSchema: {
                  type: "object",
                  properties: { clientId: { type: "number" } },
                  required: ["clientId"],
                },
              },
              {
                name: "create_client",
                description: "Create new client",
                inputSchema: {
                  type: "object",
                  properties: { clientData: { type: "object" } },
                  required: ["clientData"],
                },
              },
              {
                name: "update_client",
                description: "Update existing client",
                inputSchema: {
                  type: "object",
                  properties: {
                    clientId: { type: "number" },
                    clientData: { type: "object" },
                  },
                  required: ["clientId", "clientData"],
                },
              },
              {
                name: "delete_client",
                description: "Delete client",
                inputSchema: {
                  type: "object",
                  properties: { clientId: { type: "number" } },
                  required: ["clientId"],
                },
              },

              // Products
              {
                name: "get_products",
                description: "Get list of products",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    perPage: { type: "number" },
                    warehouseId: { type: "number" },
                    filters: { type: "object" },
                  },
                },
              },
              {
                name: "get_product",
                description: "Get single product by ID",
                inputSchema: {
                  type: "object",
                  properties: {
                    productId: { type: "number" },
                    warehouseId: { type: "number" },
                  },
                  required: ["productId"],
                },
              },
              {
                name: "create_product",
                description: "Create new product",
                inputSchema: {
                  type: "object",
                  properties: { productData: { type: "object" } },
                  required: ["productData"],
                },
              },
              {
                name: "update_product",
                description: "Update existing product",
                inputSchema: {
                  type: "object",
                  properties: {
                    productId: { type: "number" },
                    productData: { type: "object" },
                  },
                  required: ["productId", "productData"],
                },
              },

              // Payments
              {
                name: "get_payments",
                description: "Get list of payments",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    perPage: { type: "number" },
                    include: { type: "string" },
                    filters: { type: "object" },
                  },
                },
              },
              {
                name: "get_payment",
                description: "Get single payment by ID",
                inputSchema: {
                  type: "object",
                  properties: { paymentId: { type: "number" } },
                  required: ["paymentId"],
                },
              },
              {
                name: "create_payment",
                description: "Create new payment",
                inputSchema: {
                  type: "object",
                  properties: { paymentData: { type: "object" } },
                  required: ["paymentData"],
                },
              },
              {
                name: "update_payment",
                description: "Update existing payment",
                inputSchema: {
                  type: "object",
                  properties: {
                    paymentId: { type: "number" },
                    paymentData: { type: "object" },
                  },
                  required: ["paymentId", "paymentData"],
                },
              },
              {
                name: "delete_payment",
                description: "Delete payment",
                inputSchema: {
                  type: "object",
                  properties: { paymentId: { type: "number" } },
                  required: ["paymentId"],
                },
              },

              // Categories
              {
                name: "get_categories",
                description: "Get list of categories",
                inputSchema: {
                  type: "object",
                  properties: { filters: { type: "object" } },
                },
              },
              {
                name: "get_category",
                description: "Get single category by ID",
                inputSchema: {
                  type: "object",
                  properties: { categoryId: { type: "number" } },
                  required: ["categoryId"],
                },
              },
              {
                name: "create_category",
                description: "Create new category",
                inputSchema: {
                  type: "object",
                  properties: { categoryData: { type: "object" } },
                  required: ["categoryData"],
                },
              },
              {
                name: "update_category",
                description: "Update existing category",
                inputSchema: {
                  type: "object",
                  properties: {
                    categoryId: { type: "number" },
                    categoryData: { type: "object" },
                  },
                  required: ["categoryId", "categoryData"],
                },
              },
              {
                name: "delete_category",
                description: "Delete category",
                inputSchema: {
                  type: "object",
                  properties: { categoryId: { type: "number" } },
                  required: ["categoryId"],
                },
              },

              // Warehouses
              {
                name: "get_warehouses",
                description: "Get list of warehouses",
                inputSchema: {
                  type: "object",
                  properties: { filters: { type: "object" } },
                },
              },
              {
                name: "get_warehouse",
                description: "Get single warehouse by ID",
                inputSchema: {
                  type: "object",
                  properties: { warehouseId: { type: "number" } },
                  required: ["warehouseId"],
                },
              },
              {
                name: "create_warehouse",
                description: "Create new warehouse",
                inputSchema: {
                  type: "object",
                  properties: { warehouseData: { type: "object" } },
                  required: ["warehouseData"],
                },
              },
              {
                name: "update_warehouse",
                description: "Update existing warehouse",
                inputSchema: {
                  type: "object",
                  properties: {
                    warehouseId: { type: "number" },
                    warehouseData: { type: "object" },
                  },
                  required: ["warehouseId", "warehouseData"],
                },
              },
              {
                name: "delete_warehouse",
                description: "Delete warehouse",
                inputSchema: {
                  type: "object",
                  properties: { warehouseId: { type: "number" } },
                  required: ["warehouseId"],
                },
              },

              // Warehouse Documents
              {
                name: "get_warehouse_documents",
                description: "Get list of warehouse documents",
                inputSchema: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    perPage: { type: "number" },
                    filters: { type: "object" },
                  },
                },
              },
              {
                name: "get_warehouse_document",
                description: "Get single warehouse document by ID",
                inputSchema: {
                  type: "object",
                  properties: { documentId: { type: "number" } },
                  required: ["documentId"],
                },
              },
              {
                name: "create_warehouse_document",
                description: "Create new warehouse document",
                inputSchema: {
                  type: "object",
                  properties: { documentData: { type: "object" } },
                  required: ["documentData"],
                },
              },
              {
                name: "update_warehouse_document",
                description: "Update existing warehouse document",
                inputSchema: {
                  type: "object",
                  properties: {
                    documentId: { type: "number" },
                    documentData: { type: "object" },
                  },
                  required: ["documentId", "documentData"],
                },
              },
              {
                name: "delete_warehouse_document",
                description: "Delete warehouse document",
                inputSchema: {
                  type: "object",
                  properties: { documentId: { type: "number" } },
                  required: ["documentId"],
                },
              },

              // Departments
              {
                name: "get_departments",
                description: "Get list of departments",
                inputSchema: {
                  type: "object",
                  properties: { filters: { type: "object" } },
                },
              },
              {
                name: "get_department",
                description: "Get single department by ID",
                inputSchema: {
                  type: "object",
                  properties: { departmentId: { type: "number" } },
                  required: ["departmentId"],
                },
              },
              {
                name: "create_department",
                description: "Create new department",
                inputSchema: {
                  type: "object",
                  properties: { departmentData: { type: "object" } },
                  required: ["departmentData"],
                },
              },
              {
                name: "update_department",
                description: "Update existing department",
                inputSchema: {
                  type: "object",
                  properties: {
                    departmentId: { type: "number" },
                    departmentData: { type: "object" },
                  },
                  required: ["departmentId", "departmentData"],
                },
              },
              {
                name: "delete_department",
                description: "Delete department",
                inputSchema: {
                  type: "object",
                  properties: { departmentId: { type: "number" } },
                  required: ["departmentId"],
                },
              },
            ],
          },
        }),
      };
    }

    if (request.method === "tools/call") {
      const toolName = request.params?.name;
      const toolArguments = request.params?.arguments || {};

      try {
        const result = await handleFakturowniaRequest(toolName, toolArguments);
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
    const result = await handleFakturowniaRequest(
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
            data: error.message,
          },
        }),
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
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
