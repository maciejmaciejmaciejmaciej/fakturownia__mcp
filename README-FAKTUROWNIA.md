# Fakturownia MCP Server

A Model Context Protocol (MCP) server for integrating with the Fakturownia.pl API. This server provides access to invoices, clients, products, payments, categories, warehouses, and departments through a standardized MCP interface.

## Features

### 🧾 Invoices
- Get list of invoices with filtering
- Get single invoice by ID
- Create new invoices
- Update existing invoices
- Delete invoices
- Send invoices by email
- Change invoice status
- Download invoice PDFs

### 👥 Clients
- Manage client database
- Search clients by name, email, or tax number
- Full CRUD operations

### 📦 Products
- Product catalog management
- Warehouse-specific product information
- Product creation and updates

### 💰 Payments
- Payment tracking and management
- Banking integration
- Payment status updates

### 🏷️ Categories
- Product and service categorization
- Category hierarchy management

### 🏭 Warehouses
- Multi-warehouse support
- Inventory management
- Warehouse documents

### 🏢 Departments
- Organizational structure
- Department-based reporting

## Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```env
FAKTUROWNIA_DOMAIN=your-domain
FAKTUROWNIA_API_TOKEN=your-api-token
```

### 2. Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/fakturownia-mcp-server)

Or manually:

1. Fork this repository
2. Connect your GitHub account to Netlify
3. Deploy from your repository
4. Add environment variables in Netlify dashboard:
   - `FAKTUROWNIA_DOMAIN`: Your Fakturownia subdomain
   - `FAKTUROWNIA_API_TOKEN`: Your API token from Fakturownia settings

### 3. Get Your Fakturownia API Credentials

1. Log in to your Fakturownia account
2. Go to Settings → API
3. Copy your API token
4. Your domain is the subdomain in your Fakturownia URL (e.g., if your URL is `https://mycompany.fakturownia.pl`, your domain is `mycompany`)

## API Methods

### Invoices
- `get_invoices` - List invoices with pagination and filters
- `get_invoice` - Get single invoice by ID
- `create_invoice` - Create new invoice
- `update_invoice` - Update existing invoice
- `delete_invoice` - Delete invoice
- `send_invoice_by_email` - Email invoice to client
- `change_invoice_status` - Update invoice status
- `get_invoice_pdf` - Download invoice PDF

### Clients
- `get_clients` - List clients with search filters
- `get_client` - Get single client by ID
- `create_client` - Create new client
- `update_client` - Update existing client
- `delete_client` - Delete client

### Products
- `get_products` - List products with warehouse filtering
- `get_product` - Get single product by ID
- `create_product` - Create new product
- `update_product` - Update existing product

### Payments
- `get_payments` - List payments with filters
- `get_payment` - Get single payment by ID
- `create_payment` - Create new payment
- `update_payment` - Update existing payment
- `delete_payment` - Delete payment

### Categories
- `get_categories` - List all categories
- `get_category` - Get single category by ID
- `create_category` - Create new category
- `update_category` - Update existing category
- `delete_category` - Delete category

### Warehouses
- `get_warehouses` - List all warehouses
- `get_warehouse` - Get single warehouse by ID
- `create_warehouse` - Create new warehouse
- `update_warehouse` - Update existing warehouse
- `delete_warehouse` - Delete warehouse

### Warehouse Documents
- `get_warehouse_documents` - List warehouse documents
- `get_warehouse_document` - Get single document by ID
- `create_warehouse_document` - Create new document
- `update_warehouse_document` - Update existing document
- `delete_warehouse_document` - Delete document

### Departments
- `get_departments` - List all departments
- `get_department` - Get single department by ID
- `create_department` - Create new department
- `update_department` - Update existing department
- `delete_department` - Delete department

## Usage Examples

### MCP Client Integration

```typescript
// Connect to the MCP server
const client = new MCPClient({
  serverUrl: "https://your-netlify-app.netlify.app/.netlify/functions/fakturownia-server"
});

// Get list of invoices
const invoices = await client.callTool("get_invoices", {
  page: 1,
  perPage: 10,
  period: "this_month"
});

// Create new invoice
const newInvoice = await client.callTool("create_invoice", {
  invoiceData: {
    kind: "vat",
    number: null,
    sell_date: "2024-01-15",
    issue_date: "2024-01-15",
    payment_to: "2024-01-29",
    seller_name: "My Company",
    buyer_name: "Client Name",
    positions: [
      {
        name: "Service 1",
        tax: 23,
        total_price_gross: 123.00,
        quantity: 1
      }
    ]
  }
});
```

### Direct API Usage

```bash
# Health check
curl https://your-netlify-app.netlify.app/.netlify/functions/fakturownia-server

# Get invoices
curl -X POST https://your-netlify-app.netlify.app/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_invoices",
      "arguments": {
        "page": 1,
        "perPage": 5
      }
    }
  }'
```

## Make.com Integration

This server is perfect for Make.com (formerly Integromat) automations:

1. Use the HTTP module to make requests
2. Set method to POST
3. Use the server URL: `https://your-netlify-app.netlify.app/.netlify/functions/fakturownia-server`
4. Send MCP protocol requests in the body

Example Make.com scenario:
- **Trigger**: New email with invoice request
- **Action 1**: Create client (if not exists)
- **Action 2**: Create invoice
- **Action 3**: Send invoice by email

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Test the function locally
npm run test
```

### Environment Variables

- `FAKTUROWNIA_DOMAIN` - Your Fakturownia subdomain
- `FAKTUROWNIA_API_TOKEN` - Your Fakturownia API token

## Security

- API tokens are handled securely via environment variables
- CORS is properly configured for cross-origin requests
- Input validation on all API endpoints
- Error handling prevents information leakage

## Support

For Fakturownia API documentation, visit: https://app.fakturownia.pl/api

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### v1.0.0
- Initial release with full Fakturownia API coverage
- 37 API methods across all major endpoints
- Complete MCP protocol implementation
- Netlify Functions deployment ready
- Comprehensive documentation and examples
