import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleInvoicesMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_invoices":
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

      case "fakt_get_invoice":
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

      case "fakt_create_invoice":
        if (!params.invoiceData) {
          throw new Error("Invoice data is required for creating an invoice");
        }
        const createInvoiceResponse = await client.post("/invoices.json", {
          api_token: apiToken,
          invoice: params.invoiceData,
        });
        return createInvoiceResponse.data;

      case "fakt_update_invoice":
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

      case "fakt_delete_invoice":
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

      case "fakt_send_invoice_by_email":
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

      case "fakt_change_invoice_status":
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

      case "fakt_get_invoice_pdf":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Invoice API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
