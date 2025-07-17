# Fakturownia MCP Server - Copilot Instructions

## Project Overview
This is a Model Context Protocol (MCP) server that provides a standardized interface to the Fakturownia.pl invoicing API. It's deployed as a **Netlify serverless function** and exposes invoice, client, product, payment, category, warehouse, and department management tools via JSON-RPC 2.0.

## Architecture
- **Serverless deployment**: Primary code in root `fakturownia-server.ts`, re-exported in `netlify/functions/fakturownia-server.ts`
- **Critical deployment pattern**: `netlify/functions/` file MUST re-export handler from root file or Netlify returns "handler is undefined" error
- **Dual server pattern**: Both `fakturownia-server.ts` (Fakturownia) and `mcp-server.ts` (WooCommerce) exist - focus on Fakturownia unless specified
- **JSON-RPC 2.0 protocol**: All API communication follows MCP standard with `{jsonrpc: "2.0", id, method, params}` structure
- **Environment-based auth**: Uses `FAKTUROWNIA_DOMAIN` and `FAKTUROWNIA_API_TOKEN` environment variables

## Key Components

### Core Server (`fakturownia-server.ts`)
- **Handler pattern**: Netlify function exports default `Handler` that processes JSON-RPC requests
- **Method routing**: Switch statement handles `initialize`, `tools/list`, `tools/call` with nested tool methods
- **Error handling**: Custom `FakturowniaError` interface with axios error wrapping
- **API tools**: 25+ tools covering invoices, clients, products, payments, categories, warehouses, departments, warehouse documents

### Critical Deployment Issue
**Common Error**: `fakturownia-server.handler is undefined or not exported` (HTTP 502)
**Solution**: Ensure `netlify/functions/fakturownia-server.ts` contains:
```typescript
export { handler } from "../../fakturownia-server";
```

### Development Workflow
```bash
npm run dev          # Start Netlify dev server (port 8888)
npm run deploy       # Deploy to Netlify staging
npm run deploy:prod  # Deploy to production
```

### URL Structure (via `netlify.toml`)
- Function endpoint: `/.netlify/functions/fakturownia-server`
- Redirect alias: `/fakturownia` → function endpoint
- Additional redirects: `/api/*` → `/.netlify/functions/:splat`

## MCP Tool Categories

### Invoices (Primary)
- `get_invoices` (pagination: page, perPage), `get_invoice` (by ID)
- `create_invoice`, `update_invoice`, `delete_invoice`
- `send_invoice_by_email`, `change_invoice_status`, `get_invoice_pdf`

### Clients
- `get_clients`, `get_client`, `create_client`, `update_client`, `delete_client`

### Products & Inventory
- `get_products`, `get_product`, `create_product`, `update_product`
- `get_categories`, `get_warehouses`, `get_departments`

### Payments
- `get_payments`, `get_payment`, `create_payment`, `update_payment`

## API Communication Pattern
Fakturownia API uses subdomain-based endpoints:
```typescript
const baseURL = `https://${domain}.fakturownia.pl`;
const apiToken = params.api_token || DEFAULT_API_TOKEN;
```

**Standard request format:**
```json
{
  "jsonrpc": "2.0",
  "id": "1", 
  "method": "tools/call",
  "params": {
    "name": "get_invoices",
    "arguments": {"page": 1, "perPage": 10}
  }
}
```

## Development Conventions

### File Organization
- **Root-level TypeScript files are the source of truth**
- **`netlify/functions/` must re-export from root**: Critical for deployment success
- **Documentation split**: `README.md` (general), `FAKTUROWNIA-EXAMPLES.md` (Polish examples), `DEPLOY.md` (deployment)

### Common Deployment Issues
1. **Handler not found (HTTP 502)**: Missing export in `netlify/functions/fakturownia-server.ts`
2. **Environment variables**: Must be set in Netlify dashboard after deployment
3. **CORS headers**: Already configured for Make.com integration

### Error Handling Pattern
```typescript
const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && typeof error === "object" && "message" in error;
};
```

### Environment Variables
Required for deployment:
- `FAKTUROWNIA_DOMAIN`: Subdomain (e.g., "mycompany" for mycompany.fakturownia.pl)
- `FAKTUROWNIA_API_TOKEN`: API key from Fakturownia Settings → API

## Testing & Debugging
- **Local testing**: `curl` examples in `FAKTUROWNIA-EXAMPLES.md` for all endpoints
- **Health check**: GET request to function returns status
- **MCP protocol testing**: Use `tools/list` to verify all 25+ tools are registered
- **Git setup**: Use `check-git-setup.ps1` (PowerShell) or `.bat` for repository initialization

## Integration Points
- **Make.com**: HTTP module examples for workflow automation
- **Netlify**: Environment variables must be set in dashboard after deployment
- **Deploy methods**: One-click deploy button, Netlify dashboard, or CLI

## Important Notes
- Package.json incorrectly references "WooCommerce" - this is a Fakturownia server
- TypeScript compilation target: ES2020 with strict mode
- All API responses follow Fakturownia's JSON structure, not transformed by MCP layer
