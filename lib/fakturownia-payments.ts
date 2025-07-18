import { FakturowniaClient, FakturowniaHandlerParams, isAxiosError } from "./types";

export async function handlePaymentsMethods(
  method: string,
  params: FakturowniaHandlerParams,
  { client, apiToken }: FakturowniaClient
): Promise<any> {
  try {
    switch (method) {
      case "fakt_get_payments":
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

      case "fakt_get_payment":
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

      case "fakt_create_payment":
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

      case "fakt_update_payment":
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

      case "fakt_delete_payment":
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

      default:
        return null; // Method not handled by this module
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        `Payment API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
