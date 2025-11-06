# Project Structure

## Directory Organization

### `/src` - Frontend Application
Main React application source code with TypeScript.

- **`/components`** - React components
  - `/ui` - Radix UI primitives (dialog, sheet, badge, separator, etc.)
  - `/figma` - Figma-imported design components
  - `AdminPanel.tsx` - Product management interface
  - `CartSheet.tsx` - Shopping cart sidebar
  - `CategoryPage.tsx` - Product category display
  - `ImageCarousel.tsx` - Multi-image product viewer
  - `StoryPage.tsx` - Category story pages
  - `MercadoPagoCheckout.tsx` - Payment integration
  - `CheckoutSuccess/Pending/Failure.tsx` - Order status pages
  - `InventoryManager.tsx` - Stock management

- **`/utils`** - Utility functions and API clients
  - `api.ts` - Product and order API calls
  - `awsApi.ts` - AWS Lambda integration
  - `shipping.ts` - Shipping cost calculations
  - `viaCep.ts` - Brazilian postal code lookup
  - `stripe.ts` - Stripe payment utilities (legacy)

- **`/data`** - Static data and configurations
  - `stories.ts` - Category story content

- **`/imports`** - Figma-generated components and SVG assets
  - SVG icon definitions
  - Design system primitives

- **`/styles`** - Global CSS and Tailwind configuration
  - `globals.css` - Base styles and CSS variables

- **Root files**
  - `App.tsx` - Main application component with routing
  - `main.tsx` - React entry point
  - `index.css` - Global styles import

### `/aws` - Backend Infrastructure
AWS CloudFormation templates and Lambda functions.

- **`/lambda`** - Serverless functions
  - `/products` - Product CRUD operations
  - `/orders` - Order management
  - `/payments` - Payment processing
  - `/upload` - Image upload handling
  - `/analytics` - Usage tracking
  - `/inventory` - Stock management

- **Infrastructure files**
  - `template.yaml` - SAM template for backend stack
  - `frontend-stack.yaml` - CloudFront and S3 configuration
  - `monitoring-dashboard.json` - CloudWatch dashboard
  - `deploy-backend.ps1` - Backend deployment script
  - `deploy-frontend.ps1` - Frontend deployment script
  - `backup-dynamodb.bat` - Database backup automation
  - `setup-monitoring.bat` - Monitoring configuration

### `/supabase` - Edge Functions (Alternative Backend)
Supabase serverless functions for payment processing.

- **`/functions/stripe-payment`** - Stripe integration endpoint
- `config.toml` - Supabase configuration

### Root Configuration Files

- **Build & Development**
  - `package.json` - Dependencies and scripts
  - `vite.config.ts` - Vite bundler configuration
  - `tsconfig.json` - TypeScript compiler options
  - `tailwind.config.js` - Tailwind CSS configuration
  - `postcss.config.js` - PostCSS plugins

- **Deployment**
  - `deploy-frontend.bat` - Windows deployment script
  - `deploy.sh` - Unix deployment script
  - `vercel.json` - Vercel deployment config

- **Static Assets**
  - `index.html` - Main HTML entry point
  - `admin.html` - Admin panel HTML
  - `admin-new.html` - Updated admin interface

- **Documentation**
  - `README.md` - Project overview
  - `DEPLOY.md` - Deployment instructions
  - `DISASTER_RECOVERY.md` - Recovery procedures
  - `AWS_MIGRATION_GUIDE.md` - AWS setup guide
  - `MERCADOPAGO_GUIDE.md` - Payment integration docs

## Core Component Relationships

### Application Flow
```
index.html
  └─> main.tsx
      └─> App.tsx (Main Router)
          ├─> Home Page (Featured Products)
          ├─> CategoryPage (Product Listings)
          ├─> StoryPage (Category Stories)
          ├─> CartSheet (Shopping Cart)
          ├─> MercadoPagoCheckout (Payment)
          └─> CheckoutSuccess/Pending/Failure
```

### Data Flow
```
Frontend (React)
  └─> utils/api.ts
      └─> AWS API Gateway
          └─> Lambda Functions
              └─> DynamoDB Tables
```

### Admin Flow
```
admin.html
  └─> AdminPanel.tsx
      └─> utils/awsApi.ts
          └─> Lambda (Upload/Products)
              ├─> S3 (Images)
              └─> DynamoDB (Product Data)
```

## Architectural Patterns

### Frontend Architecture
- **Component-Based**: Modular React components with TypeScript
- **State Management**: React hooks (useState, useEffect) with localStorage persistence
- **UI Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS utility-first approach
- **Routing**: Client-side routing with conditional rendering

### Backend Architecture
- **Serverless**: AWS Lambda functions for compute
- **NoSQL Database**: DynamoDB for flexible schema
- **Object Storage**: S3 for images with CloudFront CDN
- **API Gateway**: RESTful endpoints for frontend communication
- **Event-Driven**: Lambda triggers for automated tasks

### Payment Architecture
- **Primary**: Mercado Pago Checkout Pro with PIX
- **Alternative**: Stripe integration (legacy support)
- **Webhook Handling**: Lambda functions for payment confirmations
- **Order Tracking**: DynamoDB order status updates

### Deployment Architecture
- **Frontend**: S3 static hosting + CloudFront distribution
- **Backend**: CloudFormation stack with SAM
- **CI/CD**: GitHub Actions + PowerShell scripts
- **Monitoring**: CloudWatch Logs, Metrics, and Alarms
- **Backup**: Automated DynamoDB snapshots

## Key Design Decisions

1. **Monorepo Structure**: Frontend and backend in single repository
2. **TypeScript**: Type safety across entire application
3. **AWS Native**: Leverages AWS services for scalability
4. **Mobile-First**: Responsive design prioritizes mobile users
5. **Persistent Cart**: localStorage ensures cart survives page refreshes
6. **Image Optimization**: Automatic compression before S3 upload
7. **Multi-Payment**: Supports both Mercado Pago and Stripe
8. **Admin Separation**: Standalone HTML for admin to reduce bundle size
