import { AxiosInstance } from "axios";

export interface FakturowniaError {
  message: string;
  code?: string;
}

export type AxiosError = {
  response?: {
    data?: FakturowniaError;
  };
  message: string;
};

export interface FakturowniaHandlerParams {
  domain?: string;
  apiToken?: string;
  [key: string]: any;
}

export interface FakturowniaClient {
  client: AxiosInstance;
  apiToken: string;
}

export const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    (error as any).response !== undefined
  );
};
