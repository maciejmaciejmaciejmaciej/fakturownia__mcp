# Przykłady użycia Fakturownia MCP Server

## Testowanie lokalnie

Uruchom serwer lokalnie:
```bash
npm run dev
```

Endpoint będzie dostępny na: `http://localhost:8888/.netlify/functions/fakturownia-server`

## Podstawowe zapytania

### 1. Health Check (GET)
```bash
curl http://localhost:8888/.netlify/functions/fakturownia-server
```

### 2. Inicjalizacja MCP
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    }
  }'
```

### 3. Lista dostępnych narzędzi
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list"
  }'
```

## Faktury (Invoices)

### Pobranie listy faktur
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_invoices",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "perPage": 10,
        "period": "this_month",
        "includePositions": true
      }
    }
  }'
```

### Pobranie faktury po ID
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_invoice",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "invoiceId": 123
      }
    }
  }'
```

### Tworzenie nowej faktury VAT
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_invoice",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "invoiceData": {
          "kind": "vat",
          "sell_date": "2024-01-16",
          "issue_date": "2024-01-16",
          "payment_to": "2024-01-23",
          "seller_name": "Moja Firma Sp. z o.o.",
          "seller_tax_no": "1234567890",
          "buyer_name": "Klient Sp. z o.o.",
          "buyer_email": "klient@example.com",
          "buyer_tax_no": "0987654321",
          "positions": [
            {
              "name": "Usługa konsultingowa",
              "tax": 23,
              "total_price_gross": 123.00,
              "quantity": 1
            },
            {
              "name": "Licencja oprogramowania",
              "tax": 23,
              "total_price_gross": 500.00,
              "quantity": 1
            }
          ]
        }
      }
    }
  }'
```

### Wysłanie faktury mailem
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "send_invoice_by_email",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "invoiceId": 123,
        "emailTo": "klient@example.com",
        "emailPdf": true
      }
    }
  }'
```

### Zmiana statusu faktury
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "change_invoice_status",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "invoiceId": 123,
        "status": "paid"
      }
    }
  }'
```

## Klienci (Clients)

### Pobranie listy klientów
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_clients",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "perPage": 20
      }
    }
  }'
```

### Wyszukiwanie klienta po NIP
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_clients",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "taxNo": "1234567890"
      }
    }
  }'
```

### Dodanie nowego klienta
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_client",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "clientData": {
          "name": "Nowa Firma Sp. z o.o.",
          "tax_no": "9876543210",
          "email": "kontakt@nowafirma.pl",
          "city": "Warszawa",
          "street": "ul. Przykładowa 1",
          "post_code": "00-001",
          "country": "PL",
          "phone": "123456789"
        }
      }
    }
  }'
```

## Produkty (Products)

### Pobranie listy produktów
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_products",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "perPage": 20
      }
    }
  }'
```

### Dodanie nowego produktu
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_product",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "productData": {
          "name": "Licencja Premium",
          "code": "LIC-PREM-001",
          "price_net": "100.00",
          "tax": "23",
          "service": "1",
          "description": "Roczna licencja na oprogramowanie Premium"
        }
      }
    }
  }'
```

## Płatności (Payments)

### Pobranie listy płatności
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_payments",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "include": "invoices"
      }
    }
  }'
```

### Dodanie nowej płatności
```bash
curl -X POST http://localhost:8888/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "create_payment",
      "arguments": {
        "domain": "yourcompany",
        "apiToken": "your-api-token",
        "paymentData": {
          "name": "Płatność za fakturę 123",
          "price": 123.00,
          "invoice_id": 123,
          "paid": true,
          "kind": "api"
        }
      }
    }
  }'
```

## Integracja z Make.com

### Konfiguracja modułu HTTP w Make.com

1. **URL**: `https://your-site.netlify.app/.netlify/functions/fakturownia-server`
2. **Method**: `POST`
3. **Headers**: `Content-Type: application/json`
4. **Body**:

```json
{
  "jsonrpc": "2.0",
  "id": "{{1.id}}",
  "method": "tools/call",
  "params": {
    "name": "create_invoice",
    "arguments": {
      "invoiceData": {
        "kind": "vat",
        "seller_name": "{{seller_name}}",
        "buyer_name": "{{buyer_name}}",
        "buyer_email": "{{buyer_email}}",
        "positions": [
          {
            "name": "{{product_name}}",
            "tax": 23,
            "total_price_gross": "{{price}}",
            "quantity": 1
          }
        ]
      }
    }
  }
}
```

### Scenariusz automatyzacji

1. **Trigger**: Nowe zamówienie w sklepie
2. **HTTP Request**: Tworzenie faktury w Fakturowni
3. **Email**: Wysłanie faktury do klienta
4. **Database**: Zapisanie numeru faktury

## Zmienne środowiskowe

Utwórz plik `.env` (lokalnie) lub ustaw w Netlify:

```env
FAKTUROWNIA_DOMAIN=yourcompany
FAKTUROWNIA_API_TOKEN=your-api-token-here
```

## Statusy faktur

- `issued` - wystawiona
- `sent` - wysłana  
- `paid` - opłacona
- `partial` - częściowo opłacona
- `rejected` - odrzucona

## Rodzaje dokumentów

- `vat` - faktura VAT
- `proforma` - faktura Proforma
- `bill` - rachunek
- `receipt` - paragon
- `advance` - faktura zaliczkowa
- `correction` - faktura korekta
