# Fakturownia MCP Server

A Model Context Protocol (MCP) server for integrating with the Fakturownia.pl API. This serverless solution provides access to invoices, clients, products, payments, categories, warehouses, and departments through a standardized MCP interface, deployed on Netlify Functions.

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/maciejmaciejmaciejmaciej/fakturownia_mcp)

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to [netlify.com](https://netlify.com) and sign up/login**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your GitHub account**
4. **Select your `fakturownia_mcp` repository**
5. **Configure build settings:**
   - Build command: (leave empty)
   - Publish directory: (leave empty)
   - Functions directory: `netlify/functions`
6. **Click "Deploy site"**

### Option 2: One-Click Deploy

Click the "Deploy to Netlify" button above for instant deployment.

## 🔧 Environment Variables Setup

After deployment, configure these environment variables in your Netlify dashboard:

1. Go to **Site settings → Environment variables**
2. Add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FAKTUROWNIA_DOMAIN` | Your Fakturownia subdomain | `mycompany` |
| `FAKTUROWNIA_API_TOKEN` | Your Fakturownia API token | `your-api-token-here` |

### Getting Fakturownia API Credentials

1. **Domain**: If your Fakturownia URL is `https://mycompany.fakturownia.pl`, your domain is `mycompany`
2. **API Token**: 
   - Log in to your Fakturownia account
   - Go to **Settings → API**
   - Copy your API token

## 📡 Your API Endpoint

After deployment, your MCP server will be available at:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server
```

Shorter URL (via netlify.toml redirect):
```
https://YOUR-SITE-NAME.netlify.app/fakturownia
```

## 🧪 Test Your Deployment

### Health Check

```bash
curl https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server
```

### Test MCP Protocol
```bash
curl -X POST https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Get Invoices
```bash
curl -X POST https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server \
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

## 🔗 Integration with Make.com

### Step 1: Create HTTP Module
1. In Make.com, add an **HTTP** module
2. Select **Make a request**

### Step 2: Configure the Request
- **URL**: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/fakturownia-server`
- **Method**: `POST`
- **Headers**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Body Type**: `Raw`
- **Content Type**: `JSON (application/json)`

### Step 3: MCP Request Body
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_invoices",
    "arguments": {
      "page": 1,
      "perPage": 10,
      "period": "this_month"
    }
  }
}
```

## 🛠️ Available API Methods

### 🧾 Invoices
- `get_invoices` - List invoices with pagination and filters
- `get_invoice` - Get single invoice by ID
- `create_invoice` - Create new invoice
- `update_invoice` - Update existing invoice
- `delete_invoice` - Delete invoice
- `send_invoice_by_email` - Email invoice to client
- `change_invoice_status` - Update invoice status
- `get_invoice_pdf` - Download invoice PDF

### 👥 Clients
- `get_clients` - List clients with search filters
- `get_client` - Get single client by ID
- `create_client` - Create new client
- `update_client` - Update existing client
- `delete_client` - Delete client

### 📦 Products
- `get_products` - List products with warehouse filtering
- `get_product` - Get single product by ID
- `create_product` - Create new product
- `update_product` - Update existing product

### 💰 Payments
- `get_payments` - List payments with filters
- `get_payment` - Get single payment by ID
- `create_payment` - Create new payment
- `update_payment` - Update existing payment
- `delete_payment` - Delete payment

### 🏷️ Categories
- `get_categories` - List all categories
- `get_category` - Get single category by ID
- `create_category` - Create new category
- `update_category` - Update existing category
- `delete_category` - Delete category

### 🏭 Warehouses
- `get_warehouses` - List all warehouses
- `get_warehouse` - Get single warehouse by ID
- `create_warehouse` - Create new warehouse
- `update_warehouse` - Update existing warehouse
- `delete_warehouse` - Delete warehouse

### 📋 Warehouse Documents
- `get_warehouse_documents` - List warehouse documents
- `get_warehouse_document` - Get single document by ID
- `create_warehouse_document` - Create new document
- `update_warehouse_document` - Update existing document
- `delete_warehouse_document` - Delete document

### 🏢 Departments
- `get_departments` - List all departments
- `get_department` - Get single department by ID
- `create_department` - Create new department
- `update_department` - Update existing department
- `delete_department` - Delete department

## 📚 Usage Examples

### Create Invoice Example
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_invoice",
    "arguments": {
      "invoiceData": {
        "kind": "vat",
        "number": null,
        "sell_date": "2024-01-15",
        "issue_date": "2024-01-15",
        "payment_to": "2024-01-29",
        "seller_name": "My Company",
        "buyer_name": "Client Name",
        "buyer_email": "client@example.com",
        "positions": [
          {
            "name": "Web Development Service",
            "tax": 23,
            "total_price_gross": 1230.00,
            "quantity": 1
          }
        ]
      }
    }
  }
}
```

### Search Clients Example
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_clients",
    "arguments": {
      "page": 1,
      "perPage": 10,
      "name": "John",
      "email": "john@example.com"
    }
  }
}
```

## 🎯 Make.com Automation Examples

### 1. Invoice Creation Workflow
**Trigger**: New email with invoice request
1. **Email Parser** - Extract client and service details
2. **HTTP Request** - Search for existing client
3. **HTTP Request** - Create client if not found
4. **HTTP Request** - Create invoice
5. **HTTP Request** - Send invoice by email

### 2. Payment Tracking
**Trigger**: Webhook from payment processor
1. **HTTP Request** - Find invoice by number
2. **HTTP Request** - Create payment record
3. **HTTP Request** - Update invoice status to "paid"

### 3. Inventory Management
**Trigger**: Schedule (daily)
1. **HTTP Request** - Get low stock products
2. **HTTP Request** - Create purchase orders
3. **Email** - Send stock alerts

## 🛡️ Security Features

- ✅ API tokens handled via environment variables
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Error handling prevents information leakage
- ✅ Serverless architecture for scalability

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start local development server
netlify dev

# Test the function locally
npm run test
```

## 📖 Documentation

- **[Complete Setup Guide](FAKTUROWNIA-README.md)** - Detailed configuration instructions
- **[Usage Examples](FAKTUROWNIA-EXAMPLES.md)** - Practical examples and testing
- **[Deployment Guide](GITHUB-NETLIFY-DEPLOY.md)** - GitHub and Netlify setup
- **[Fakturownia API Docs](https://app.fakturownia.pl/api)** - Official API documentation

## 🚀 Quick Start

1. **Fork this repository**
2. **Deploy to Netlify** using the button above
3. **Add environment variables** (domain + API token)
4. **Test your endpoints** using the examples above
5. **Integrate with Make.com** or your preferred automation platform

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For Fakturownia API documentation and support:
- **API Docs**: https://app.fakturownia.pl/api
- **Fakturownia Support**: Contact your Fakturownia account manager

---

**Ready to automate your invoicing with Fakturownia? Deploy now and start building powerful integrations!** 🚀

| Method | Description |
|--------|-------------|
| `get_product_attributes` | Retrieve product attributes |
| `get_product_attribute` | Get a single product attribute |
| `create_product_attribute` | Create a new product attribute |
| `update_product_attribute` | Update a product attribute |
| `delete_product_attribute` | Delete a product attribute |
| `get_attribute_terms` | Retrieve attribute terms |
| `get_attribute_term` | Get a single attribute term |
| `create_attribute_term` | Create a new attribute term |
| `update_attribute_term` | Update an attribute term |
| `delete_attribute_term` | Delete an attribute term |

### Product Variations

| Method | Description |
|--------|-------------|
| `get_product_variations` | Retrieve product variations |
| `get_product_variation` | Get a single product variation |
| `create_product_variation` | Create a new product variation |
| `update_product_variation` | Update a product variation |
| `delete_product_variation` | Delete a product variation |

### Product Reviews

| Method | Description |
|--------|-------------|
| `get_product_reviews` | Retrieve product reviews |
| `get_product_review` | Get a single product review |
| `create_product_review` | Create a new product review |
| `update_product_review` | Update a product review |
| `delete_product_review` | Delete a product review |

### WooCommerce Orders

| Method | Description |
|--------|-------------|
| `get_orders` | Retrieve a list of orders |
| `get_order` | Get a single order by ID |
| `create_order` | Create a new order |
| `update_order` | Update an existing order |
| `delete_order` | Delete an order |
| `get_order_meta` | Get order metadata |
| `create_order_meta` | Create/update order metadata |
| `update_order_meta` | Update order metadata (alias for create) |
| `delete_order_meta` | Delete order metadata |

### Order Notes

| Method | Description |
|--------|-------------|
| `get_order_notes` | Retrieve order notes |
| `get_order_note` | Get a single order note |
| `create_order_note` | Create a new order note |
| `delete_order_note` | Delete an order note |

### Order Refunds

| Method | Description |
|--------|-------------|
| `get_order_refunds` | Retrieve order refunds |
| `get_order_refund` | Get a single order refund |
| `create_order_refund` | Create a new order refund |
| `delete_order_refund` | Delete an order refund |

### WooCommerce Customers

| Method | Description |
|--------|-------------|
| `get_customers` | Retrieve a list of customers |
| `get_customer` | Get a single customer by ID |
| `create_customer` | Create a new customer |
| `update_customer` | Update an existing customer |
| `delete_customer` | Delete a customer |
| `get_customer_meta` | Get customer metadata |
| `create_customer_meta` | Create/update customer metadata |
| `update_customer_meta` | Update customer metadata (alias for create) |
| `delete_customer_meta` | Delete customer metadata |

### Shipping

| Method | Description |
|--------|-------------|
| `get_shipping_zones` | Retrieve shipping zones |
| `get_shipping_zone` | Get a single shipping zone |
| `create_shipping_zone` | Create a new shipping zone |
| `update_shipping_zone` | Update a shipping zone |
| `delete_shipping_zone` | Delete a shipping zone |
| `get_shipping_methods` | Retrieve shipping methods |
| `get_shipping_zone_methods` | Get shipping methods for a zone |
| `create_shipping_zone_method` | Create a new shipping method for a zone |
| `update_shipping_zone_method` | Update a shipping method for a zone |
| `delete_shipping_zone_method` | Delete a shipping method from a zone |
| `get_shipping_zone_locations` | Get locations for a shipping zone |
| `update_shipping_zone_locations` | Update locations for a shipping zone |

### Taxes

| Method | Description |
|--------|-------------|
| `get_tax_classes` | Retrieve tax classes |
| `create_tax_class` | Create a new tax class |
| `delete_tax_class` | Delete a tax class |
| `get_tax_rates` | Retrieve tax rates |
| `get_tax_rate` | Get a single tax rate |
| `create_tax_rate` | Create a new tax rate |
| `update_tax_rate` | Update a tax rate |
| `delete_tax_rate` | Delete a tax rate |

### Discounts/Coupons

| Method | Description |
|--------|-------------|
| `get_coupons` | Retrieve coupons |
| `get_coupon` | Get a single coupon |
| `create_coupon` | Create a new coupon |
| `update_coupon` | Update a coupon |
| `delete_coupon` | Delete a coupon |

### Payment Gateways

| Method | Description |
|--------|-------------|
| `get_payment_gateways` | Retrieve payment gateways |
| `get_payment_gateway` | Get a single payment gateway |
| `update_payment_gateway` | Update a payment gateway |

### Reports

| Method | Description |
|--------|-------------|
| `get_sales_report` | Retrieve sales reports |
| `get_products_report` | Retrieve products reports |
| `get_orders_report` | Retrieve orders reports |
| `get_categories_report` | Retrieve categories reports |
| `get_customers_report` | Retrieve customers reports |
| `get_stock_report` | Retrieve stock reports |
| `get_coupons_report` | Retrieve coupons reports |
| `get_taxes_report` | Retrieve taxes reports |

### Settings

| Method | Description |
|--------|-------------|
| `get_settings` | Retrieve all settings |
| `get_setting_options` | Retrieve options for a setting |
| `update_setting_option` | Update a setting option |

### System Status

| Method | Description |
|--------|-------------|
| `get_system_status` | Retrieve system status |
| `get_system_status_tools` | Retrieve system status tools |
| `run_system_status_tool` | Run a system status tool |

### Data

| Method | Description |
|--------|-------------|
| `get_data` | Retrieve store data |
| `get_continents` | Retrieve continents data |
| `get_countries` | Retrieve countries data |
| `get_currencies` | Retrieve currencies data |
| `get_current_currency` | Get the current currency |

## Method Parameters

All methods follow a similar parameter structure. Here are some examples:

### Common Parameters for All Methods

- `siteUrl`: (optional if set in env) WordPress site URL

### Additional Parameters for WooCommerce Methods

- `consumerKey`: (optional if set in env) WooCommerce consumer key
- `consumerSecret`: (optional if set in env) WooCommerce consumer secret

### Additional Parameters for WordPress Methods

- `username`: (optional if set in env) WordPress username
- `password`: (optional if set in env) WordPress password

## Example Usage

### WordPress API Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "create_post",
  "params": {
    "siteUrl": "https://your-wordpress-site.com",
    "username": "your-wordpress-username",
    "password": "your-wordpress-password",
    "title": "My New Blog Post",
    "content": "This is the content of my new blog post.",
    "status": "publish"
  }
}
```

### WooCommerce Products Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_products",
  "params": {
    "perPage": 20,
    "page": 1,
    "filters": {
      "category": 19,
      "status": "publish"
    }
  }
}
```

### Create Product Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "create_product",
  "params": {
    "productData": {
      "name": "Premium T-Shirt",
      "type": "simple",
      "regular_price": "29.99",
      "description": "Comfortable cotton t-shirt, available in various sizes.",
      "short_description": "Premium quality t-shirt.",
      "categories": [
        {
          "id": 19
        }
      ],
      "images": [
        {
          "src": "http://example.com/wp-content/uploads/2022/06/t-shirt.jpg"
        }
      ]
    }
  }
}
```

### Product Metadata Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "create_product_meta",
  "params": {
    "productId": 456,
    "metaKey": "_custom_product_field",
    "metaValue": {
      "special_attribute": "value",
      "another_attribute": 42
    }
  }
}
```

### Order Metadata Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "create_order_meta",
  "params": {
    "orderId": 789,
    "metaKey": "_delivery_instructions",
    "metaValue": "Leave package at the back door"
  }
}
```

## Security Note

For WooCommerce REST API access, you need to generate API keys. You can create them in your WordPress dashboard under WooCommerce → Settings → Advanced → REST API.

## Requirements

- Node.js 20.0.0 or higher
- WordPress site with WooCommerce plugin installed
- WooCommerce REST API keys

## License

MIT License - See LICENSE file for details
