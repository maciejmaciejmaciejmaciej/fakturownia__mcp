import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleCategoriesMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_categories":
        const categoriesResponse = await client.get("/categories.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return categoriesResponse.data;

      case "fakt_get_category":
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

      case "fakt_create_category":
        if (!params.categoryData) {
          throw new Error("Category data is required for creating a category");
        }
        const createCategoryResponse = await client.post("/categories.json", {
          api_token: apiToken,
          category: params.categoryData,
        });
        return createCategoryResponse.data;

      case "fakt_update_category":
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

      case "fakt_delete_category":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Category API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
