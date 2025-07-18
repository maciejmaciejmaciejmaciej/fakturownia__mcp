// USUNIĘTE - Ten plik został usunięty z projektu Fakturownia MCP
// Tylko Fakturownia.pl jest obsługiwana w tym projekcie
// Wszystkie funkcje WooCommerce zostały usunięte

// Używaj fakturownia-server.ts zamiast tego pliku
export default {};

// Export pusty handler żeby nie było błędów w woocommerce-server.ts
export const handler = async () => {
  return {
    statusCode: 410,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      error: "WooCommerce server został usunięty. Używaj /fakturownia endpoint"
    })
  };
};
