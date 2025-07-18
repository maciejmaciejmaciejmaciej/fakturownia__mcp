import { FakturowniaClient, FakturowniaHandlerParams } from "./types";
import { handleInvoicesMethods } from "./fakturownia-invoices";
import { handleClientsMethods } from "./fakturownia-clients";
import { handleProductsMethods } from "./fakturownia-products";
import { handlePaymentsMethods } from "./fakturownia-payments";
import { handleCategoriesMethods } from "./fakturownia-categories";
import { handleWarehousesMethods } from "./fakturownia-warehouses";
import { handleDepartmentsMethods } from "./fakturownia-departments";

export async function handleFakturowniaRequest(
  method: string,
  params: FakturowniaHandlerParams,
  fakturowniaClient: FakturowniaClient
): Promise<any> {
  // Try each module until one handles the method
  const modules = [
    handleInvoicesMethods,
    handleClientsMethods,
    handleProductsMethods,
    handlePaymentsMethods,
    handleCategoriesMethods,
    handleWarehousesMethods,
    handleDepartmentsMethods,
  ];

  for (const moduleHandler of modules) {
    const result = await moduleHandler(method, params, fakturowniaClient);
    if (result !== null) {
      return result;
    }
  }

  throw new Error(`Unknown method: ${method}`);
}
