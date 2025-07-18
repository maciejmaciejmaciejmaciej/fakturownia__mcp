import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleProductsMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_products":
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

      case "fakt_get_product":
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

      case "fakt_create_product":
        if (!params.productData) {
          throw new Error("Product data is required for creating a product");
        }
        const createProductResponse = await client.post("/products.json", {
          api_token: apiToken,
          product: params.productData,
        });
        return createProductResponse.data;

      case "fakt_update_product":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Product API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
