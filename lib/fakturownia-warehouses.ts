import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleWarehousesMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_warehouses":
        const warehousesResponse = await client.get("/warehouses.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return warehousesResponse.data;

      case "fakt_get_warehouse":
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

      case "fakt_create_warehouse":
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

      case "fakt_update_warehouse":
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

      case "fakt_delete_warehouse":
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

      case "fakt_get_warehouse_documents":
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

      case "fakt_get_warehouse_document":
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

      case "fakt_create_warehouse_document":
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

      case "fakt_update_warehouse_document":
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

      case "fakt_delete_warehouse_document":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Warehouse API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
