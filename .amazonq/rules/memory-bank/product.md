# Product Overview

## Project Purpose
Sweet Bar - Menu de Natal 2025 is a full-stack e-commerce web application for selling artisanal Christmas chocolates and seasonal products. The platform provides a digital menu with integrated payment processing through Mercado Pago and a complete AWS backend infrastructure.

## Value Proposition
- Professional digital storefront for Sweet Bar Chocolates
- Seamless online ordering experience with multiple payment options
- Real-time inventory management and order tracking
- Scalable cloud infrastructure for high-traffic holiday seasons
- Mobile-responsive design for customers on any device

## Key Features

### Customer-Facing Features
- **Digital Menu**: Browse products by category (Advent Calendars, Panettone, Chocolate Bars)
- **Featured Products**: Highlighted items on homepage with visual emphasis
- **Product Details**: Multi-image carousels (up to 10 images), ingredients, weight, tags
- **Shopping Cart**: Persistent cart using localStorage with quantity management
- **Checkout System**: Integrated Mercado Pago payment processing with PIX support
- **Shipping Calculator**: Real-time shipping cost calculation via ViaCEP integration
- **Order Tracking**: Success/pending/failure pages with order status
- **Responsive Design**: Mobile-first approach with Radix UI components

### Administrative Features
- **Admin Panel**: Password-protected dashboard at `/admin.html`
- **Product Management**: Add, edit, delete products with full CRUD operations
- **Image Upload**: Automatic image compression and S3 storage
- **Featured Toggle**: Mark products for homepage display
- **Category Management**: Organize products into logical groups
- **Inventory Tracking**: Monitor stock levels and product availability

### Technical Features
- **AWS Backend**: Lambda functions for products, orders, payments, analytics
- **DynamoDB Storage**: NoSQL database for products and orders
- **S3 + CloudFront**: Image hosting with CDN distribution
- **Payment Integration**: Mercado Pago Checkout Pro with PIX
- **Monitoring**: CloudWatch dashboards and alarms
- **Automated Backups**: Daily DynamoDB backups at 3 AM
- **CI/CD**: GitHub Actions for automated deployments

## Target Users

### Primary Users (Customers)
- Brazilian consumers shopping for Christmas gifts
- People seeking artisanal, premium chocolate products
- Mobile users browsing on smartphones and tablets
- Gift buyers looking for advent calendars and panettone

### Secondary Users (Administrators)
- Sweet Bar store owners managing inventory
- Marketing team updating featured products
- Operations staff monitoring orders and payments

## Use Cases

### Customer Journey
1. Browse featured products on homepage
2. Navigate to category pages (Advent, Panettone, Bars)
3. View product details with images and ingredients
4. Add items to cart with quantity selection
5. Enter shipping address for cost calculation
6. Complete checkout via Mercado Pago (PIX or card)
7. Receive order confirmation and tracking

### Admin Operations
1. Login to admin panel with password
2. Add new seasonal products with images
3. Update pricing and descriptions
4. Toggle featured status for promotions
5. Monitor inventory levels
6. Review order analytics

### Business Operations
- Deploy updates via automated scripts
- Monitor performance through CloudWatch
- Backup data daily for disaster recovery
- Scale infrastructure during peak seasons
- Track sales and customer behavior
