import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleDepartmentsMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_departments":
        const departmentsResponse = await client.get("/departments.json", {
          params: {
            api_token: apiToken,
            ...params.filters,
          },
        });
        return departmentsResponse.data;

      case "fakt_get_department":
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

      case "fakt_create_department":
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

      case "fakt_update_department":
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

      case "fakt_delete_department":
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
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Department API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
