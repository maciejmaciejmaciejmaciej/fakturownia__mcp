# Fakturownia MCP Server for Netlify

A serverless Fakturownia MCP (Model Context Protocol) server deployed on Netlify Functions. This allows you to interact with Fakturownia.pl (Polish invoicing system) via JSON-RPC API calls from Make.com and other automation platforms.

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to [netlify.com](https://netlify.com) and sign up/login**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your Git provider** (GitHub, GitLab, etc.)
4. **Select this repository**
5. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
6. **Click "Deploy site"**

### Option 2: Deploy via Netlify CLI

```bash
# Install dependencies
npm install

# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize your site
netlify init

# Deploy to production
netlify deploy --prod
```

## 🔧 Environment Variables Setup

After deployment, configure these environment variables in your Netlify dashboard:

1. Go to **Site settings → Environment variables**
2. Add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FAKTUROWNIA_DOMAIN` | Your Fakturownia domain (without .fakturownia.pl) | `yourcompany` |
| `FAKTUROWNIA_API_TOKEN` | Your Fakturownia API token | `xxxxxxxxxxxxxx` |

### Getting Fakturownia API Token

1. Log into your Fakturownia account
2. Go to **Ustawienia → Ustawienia konta → Integracja**
3. Copy your **Kod autoryzacyjny API**

## 📡 Your API Endpoint

After deployment, your MCP server will be available at:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server
```

You can also access it via these shorter URLs by adding redirects in `netlify.toml`:
```
https://YOUR-SITE-NAME.netlify.app/fakturownia
https://YOUR-SITE-NAME.netlify.app/api/fakturownia-server
```

## 🧪 Test Your Deployment

Test with a simple GET invoices request:

```bash
curl -X POST https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "get_invoices",
    "params": {
      "perPage": 5,
      "period": "this_month"
    }
  }'
```

## 🔗 Integration with Make.com

### Step 1: Create HTTP Module
1. In Make.com, add an **HTTP** module
2. Select **Make a request**

### Step 2: Configure the Request
- **URL**: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server`
- **Method**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body Type**: `Raw`
- **Content Type**: `JSON (application/json)`

### Step 3: Request Body Format for MCP Protocol
```json
{
  "jsonrpc": "2.0",
  "id": "{{1.id}}",
  "method": "tools/call",
  "params": {
    "name": "get_invoices",
    "arguments": {
      "perPage": 10,
      "page": 1,
      "period": "this_month"
    }
  }
}
```

### Step 4: Direct API Calls (Alternative)
```json
{
  "jsonrpc": "2.0",
  "id": "{{1.id}}",
  "method": "get_invoices",
  "params": {
    "perPage": 10,
    "page": 1,
    "period": "this_month"
  }
}
```

## 📋 Available Methods

### Invoices (Faktury)
- `get_invoices` - Get list of invoices
- `get_invoice` - Get single invoice by ID
- `create_invoice` - Create new invoice
- `update_invoice` - Update existing invoice
- `delete_invoice` - Delete invoice
- `send_invoice_by_email` - Send invoice by email
- `change_invoice_status` - Change invoice status
- `get_invoice_pdf` - Get invoice PDF file

### Clients (Klienci)
- `get_clients` - Get list of clients
- `get_client` - Get single client by ID
- `create_client` - Create new client
- `update_client` - Update existing client
- `delete_client` - Delete client

### Products (Produkty)
- `get_products` - Get list of products
- `get_product` - Get single product by ID
- `create_product` - Create new product
- `update_product` - Update existing product

### Payments (Płatności)
- `get_payments` - Get list of payments
- `get_payment` - Get single payment by ID
- `create_payment` - Create new payment
- `update_payment` - Update existing payment
- `delete_payment` - Delete payment

### Categories (Kategorie)
- `get_categories` - Get list of categories
- `get_category` - Get single category by ID
- `create_category` - Create new category
- `update_category` - Update existing category
- `delete_category` - Delete category

### Warehouses (Magazyny)
- `get_warehouses` - Get list of warehouses
- `get_warehouse` - Get single warehouse by ID
- `create_warehouse` - Create new warehouse
- `update_warehouse` - Update existing warehouse
- `delete_warehouse` - Delete warehouse

### Warehouse Documents (Dokumenty magazynowe)
- `get_warehouse_documents` - Get list of warehouse documents
- `get_warehouse_document` - Get single warehouse document by ID
- `create_warehouse_document` - Create new warehouse document
- `update_warehouse_document` - Update existing warehouse document
- `delete_warehouse_document` - Delete warehouse document

### Departments (Działy)
- `get_departments` - Get list of departments
- `get_department` - Get single department by ID
- `create_department` - Create new department
- `update_department` - Update existing department
- `delete_department` - Delete department

## 📖 Example Usage

### Create Invoice
```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "create_invoice",
  "params": {
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
          "name": "Usługa A",
          "tax": 23,
          "total_price_gross": 123.00,
          "quantity": 1
        }
      ]
    }
  }
}
```

### Get Client by Tax Number
```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "get_clients",
  "params": {
    "taxNo": "1234567890"
  }
}
```

### Send Invoice by Email
```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "send_invoice_by_email",
  "params": {
    "invoiceId": 123,
    "emailTo": "klient@example.com",
    "emailPdf": true
  }
}
```

## 🔒 Authentication

The server uses Fakturownia API Token authentication. You can provide credentials in two ways:

1. **Environment Variables** (Recommended):
   - `FAKTUROWNIA_DOMAIN`
   - `FAKTUROWNIA_API_TOKEN`

2. **Request Parameters**:
   ```json
   {
     "params": {
       "domain": "yourcompany",
       "apiToken": "your-api-token",
       "invoiceData": {...}
     }
   }
   ```

## 🌍 Polish Invoicing Features

This MCP server supports all Fakturownia.pl features including:
- VAT invoices (Faktury VAT)
- Proforma invoices (Faktury Proforma)
- Receipts (Paragony)
- Advance invoices (Faktury zaliczkowe)
- Correction invoices (Faktury korygujące)
- OSS/MOSS invoices
- GTU codes
- Split payment (Mechanizm podzielonej płatności)

## 📚 API Documentation

For detailed API documentation, visit:
- [Fakturownia API Documentation](https://app.fakturownia.pl/api)
- [Fakturownia Help Center](https://pomoc.fakturownia.pl/)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
