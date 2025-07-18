import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handleClientsMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_clients":
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

      case "fakt_get_client":
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

      case "fakt_create_client":
        if (!params.clientData) {
          throw new Error("Client data is required for creating a client");
        }
        const createClientResponse = await client.post("/clients.json", {
          api_token: apiToken,
          client: params.clientData,
        });
        return createClientResponse.data;

      case "fakt_update_client":
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

      case "fakt_delete_client":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Client API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
