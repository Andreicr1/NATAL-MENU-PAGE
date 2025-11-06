# Technology Stack

## Programming Languages

### Frontend
- **TypeScript 5.x** - Primary language for type-safe React development
- **JavaScript ES2020** - Runtime target for browser compatibility
- **CSS3** - Styling with Tailwind utility classes
- **HTML5** - Semantic markup

### Backend
- **Node.js 20.x** - Lambda runtime environment
- **TypeScript** - Lambda function development
- **Shell/PowerShell** - Deployment automation scripts

## Core Frameworks & Libraries

### Frontend Framework
- **React 18.3.1** - UI library with hooks and functional components
- **React DOM 18.3.1** - DOM rendering
- **React Router DOM 7.9.5** - Client-side routing

### Build Tools
- **Vite 6.3.5** - Fast build tool and dev server
- **@vitejs/plugin-react-swc 3.10.2** - React plugin with SWC compiler
- **TypeScript Compiler** - Type checking and transpilation

### UI Component Library
- **Radix UI** - Accessible, unstyled component primitives
  - Dialog, Sheet, Dropdown, Popover, Tooltip
  - Accordion, Tabs, Select, Checkbox, Switch
  - Navigation Menu, Context Menu, Hover Card
  - Progress, Slider, Radio Group, Scroll Area
- **Lucide React 0.487.0** - Icon library
- **Embla Carousel React 8.6.0** - Image carousel

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - Vendor prefix automation
- **cssnano 7.1.1** - CSS minification
- **class-variance-authority 0.7.1** - Component variant management
- **tailwind-merge** - Tailwind class merging utility
- **clsx** - Conditional class names

### State & Forms
- **React Hook Form 7.55.0** - Form validation and management
- **React Day Picker 8.10.1** - Date selection
- **input-otp 1.4.2** - OTP input component

### UI Enhancements
- **Sonner 2.0.3** - Toast notifications
- **Vaul 1.1.2** - Drawer component
- **cmdk 1.1.1** - Command menu
- **next-themes 0.4.6** - Theme management
- **react-resizable-panels 2.1.7** - Resizable layouts
- **recharts 2.15.2** - Data visualization

## Backend Technologies

### AWS Services
- **Lambda** - Serverless compute for API endpoints
- **API Gateway** - RESTful API management
- **DynamoDB** - NoSQL database for products and orders
- **S3** - Object storage for product images
- **CloudFront** - CDN for static assets and images
- **CloudWatch** - Logging, metrics, and monitoring
- **CloudFormation/SAM** - Infrastructure as Code

### Payment Processing
- **Mercado Pago 2.9.0** - Primary payment gateway (Brazil)
  - Checkout Pro integration
  - PIX payment support
- **Stripe 17.4.0** - Alternative payment processor
  - @stripe/stripe-js 4.8.0 - Client-side SDK
  - @stripe/react-stripe-js 2.8.1 - React components
  - @stripe/connect-js 3.3.31 - Connect platform

### Alternative Backend (Legacy)
- **Supabase 2.53.6** - Backend-as-a-Service
  - @supabase/supabase-js 2.47.10 - Client library
  - Edge Functions with Hono framework

## Development Tools

### Package Management
- **npm** - Package manager
- **Node.js 20.x** - Runtime environment

### Code Quality
- **TypeScript Strict Mode** - Enabled for type safety
  - noUnusedLocals
  - noUnusedParameters
  - noFallthroughCasesInSwitch
  - forceConsistentCasingInFileNames

### Testing
- **Vitest** - Unit testing framework
- **@types/node 20.10.0** - Node.js type definitions
- **@types/react 19.2.2** - React type definitions
- **@types/react-dom 19.2.2** - React DOM type definitions

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build to /dist
npm test             # Run unit tests
npm test:ui          # Run tests with UI
```

### AWS Deployment
```bash
npm run aws:deploy   # Deploy backend Lambda functions
npm run aws:frontend # Deploy frontend to S3/CloudFront
npm run aws:upload   # Upload frontend files only
npm run aws:logs     # Tail Lambda logs
npm run aws:delete   # Delete CloudFormation stack
```

### Supabase Deployment
```bash
npm run deploy:stripe  # Deploy Stripe edge function
npm run logs:stripe    # View edge function logs
```

### Manual Deployment
```bash
# Windows
.\deploy-frontend.bat
.\aws\backup-dynamodb.bat
.\aws\setup-monitoring.bat

# Unix/Linux
./deploy.sh
./aws/deploy.sh
```

## Build Configuration

### Vite Configuration
- **Target**: ES2015 for broad browser support
- **Output**: dist/ directory
- **Dev Server**: Port 3000 with auto-open
- **Plugins**: React SWC for fast compilation
- **Aliases**: @ mapped to ./src for clean imports

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx (automatic runtime)
- **Strict Mode**: Enabled
- **Path Mapping**: @/* to ./src/*
- **Exclude**: node_modules, build, supabase functions

### Tailwind Configuration
- **Content**: Scans src/**/*.{ts,tsx,html}
- **Theme**: Custom color palette and spacing
- **Plugins**: Forms, typography, aspect-ratio

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL                    # AWS API Gateway endpoint
VITE_ADMIN_PASSWORD             # Admin panel password
VITE_MERCADOPAGO_PUBLIC_KEY     # Mercado Pago public key
VITE_STRIPE_PUBLIC_KEY          # Stripe publishable key
VITE_SUPABASE_URL               # Supabase project URL
VITE_SUPABASE_ANON_KEY          # Supabase anonymous key
```

### Backend (Lambda Environment)
```
MERCADOPAGO_ACCESS_TOKEN        # Mercado Pago private key
STRIPE_SECRET_KEY               # Stripe secret key
DYNAMODB_TABLE_PRODUCTS         # Products table name
DYNAMODB_TABLE_ORDERS           # Orders table name
S3_BUCKET_IMAGES                # Image storage bucket
```

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile**: iOS Safari 12+, Chrome Android 90+
- **ES2015+**: Required for build output

## Deployment Targets
- **Production**: AWS S3 + CloudFront (d3c3no9shu6bly.cloudfront.net)
- **API**: AWS API Gateway (963pa03698.execute-api.us-east-1.amazonaws.com)
- **Region**: us-east-1 (N. Virginia)
- **CDN**: CloudFront global distribution
