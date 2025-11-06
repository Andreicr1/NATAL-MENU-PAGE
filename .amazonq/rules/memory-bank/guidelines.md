# Development Guidelines

## Code Quality Standards

### TypeScript Configuration
- **Strict Mode Enabled**: All TypeScript strict checks are enforced
  - `noUnusedLocals: true` - No unused local variables
  - `noUnusedParameters: true` - No unused function parameters
  - `noFallthroughCasesInSwitch: true` - Explicit break in switch cases
  - `forceConsistentCasingInFileNames: true` - Consistent file naming
- **Target**: ES2020 for modern JavaScript features
- **Module Resolution**: Bundler mode for Vite compatibility
- **JSX**: react-jsx (automatic React runtime, no import React needed)

### File Naming Conventions
- **Components**: PascalCase with .tsx extension (e.g., `CartSheet.tsx`, `AdminPanel.tsx`)
- **Utilities**: camelCase with .ts extension (e.g., `api.ts`, `shipping.ts`)
- **UI Components**: PascalCase in `/components/ui/` (e.g., `sidebar.tsx`, `dialog.tsx`)
- **Data Files**: camelCase with .ts extension (e.g., `stories.ts`)
- **Configuration**: kebab-case or standard names (e.g., `vite.config.ts`, `tailwind.config.js`)

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Semicolons**: Required at end of statements
- **Line Length**: No strict limit, but prefer readability
- **Trailing Commas**: Used in multi-line arrays and objects

### Import Organization
1. **External Libraries First**: React, third-party packages
2. **Lucide Icons**: Grouped together after React
3. **Internal Components**: Local component imports
4. **UI Components**: Radix UI and custom UI components
5. **Utilities**: API clients, helpers, data
6. **Types**: Interface and type imports (often inline with usage)

Example from App.tsx:
```typescript
import { ChevronRight, Instagram, Menu, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPanel } from './components/AdminPanel';
import { CartSheet } from './components/CartSheet';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent } from './components/ui/dialog';
import { fetchProducts } from './utils/api';
```

## React Patterns

### Component Structure
- **Functional Components Only**: No class components
- **Hooks-Based State**: useState, useEffect, useCallback, useMemo
- **TypeScript Interfaces**: Define props and state types explicitly
- **Default Exports**: Main components use default export

### State Management
- **Local State**: useState for component-specific state
- **Persistent State**: localStorage for cart and user preferences
- **Effect Synchronization**: useEffect to sync state with localStorage
- **Callback Optimization**: useCallback for event handlers passed to children
- **Memoization**: useMemo for expensive computations

Example from App.tsx:
```typescript
const [cart, setCart] = useState<CartItem[]>(() => {
  const saved = localStorage.getItem('sweetbar-cart');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('sweetbar-cart', JSON.stringify(cart));
}, [cart]);
```

### Event Handlers
- **Inline Arrow Functions**: For simple handlers in JSX
- **Named Functions**: For complex logic or reusable handlers
- **Callback Pattern**: Update state immutably using functional updates

Example:
```typescript
const addToCart = (product: Product) => {
  setCart(prevCart => {
    const existingItem = prevCart.find(item => item.product.id === product.id);
    if (existingItem) {
      return prevCart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prevCart, { product, quantity: 1 }];
  });
};
```

### Conditional Rendering
- **Ternary Operators**: For simple conditions
- **Logical AND (&&)**: For conditional display
- **Early Returns**: For guard clauses and error states
- **Hidden Class**: Use `hidden` class instead of conditional rendering for performance

Example:
```typescript
{cartItemCount > 0 && (
  <button onClick={() => setIsCartOpen(true)}>
    <ShoppingCart />
  </button>
)}
```

## Styling Conventions

### Tailwind CSS Usage
- **Utility-First**: Compose styles using Tailwind utility classes
- **Custom CSS Variables**: Define colors and spacing in CSS variables
- **Responsive Design**: Mobile-first with breakpoint prefixes (md:, lg:)
- **Dynamic Classes**: Use template literals for conditional classes
- **cn() Helper**: Use `cn()` utility for merging class names

Example:
```typescript
className={cn(
  "w-full flex items-center gap-[12px] px-[17px] py-[15px]",
  selectedCategory === category.id
    ? 'bg-[#fbf7e8] border border-[#d4af37]'
    : 'border border-transparent'
)}
```

### Color Palette
- **Primary Burgundy**: `#5c0108` - Main brand color
- **Gold Accent**: `#d4af37` - Highlights and CTAs
- **Cream Background**: `#fbf7e8` - Page background
- **Light Gold**: `#e8d4a2` - Secondary accents
- **Text Colors**: Burgundy for headings, gray for body text

### Typography
- **Font Family**: 'Libre_Baskerville' for elegant, serif look
- **Font Sizes**: Use clamp() for responsive typography
- **Line Heights**: Generous spacing for readability
- **Font Weights**: Normal (400), Bold (700), Italic for emphasis

### Spacing
- **Consistent Units**: Use px values with brackets `[24px]` for exact spacing
- **Gap Utilities**: Prefer `gap-[X]` over margin for flex/grid layouts
- **Padding**: Use `px-[X] py-[Y]` pattern for consistent padding
- **Rounded Corners**: `rounded-[14px]` for buttons, `rounded-xl` for cards

## Component Patterns

### Radix UI Integration
- **Accessible Primitives**: Use Radix UI for dialogs, sheets, tooltips
- **Compound Components**: Follow Radix patterns (Dialog + DialogContent + DialogHeader)
- **Controlled State**: Manage open/close state externally
- **ARIA Labels**: Always provide aria-label or sr-only descriptions

Example:
```typescript
<Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{selectedProduct.name}</DialogTitle>
      <DialogDescription className="sr-only">
        Detalhes completos do produto
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Sheet Pattern (Sidebar/Cart)
- **Side Prop**: Specify 'left' or 'right' for slide direction
- **Controlled State**: Use `open` and `onOpenChange` props
- **Mobile-First**: Sheets work well for mobile navigation
- **Custom Styling**: Override default styles with className

### Toast Notifications
- **Sonner Library**: Use `toast.success()`, `toast.error()`
- **Brief Messages**: Keep notifications concise
- **Duration**: Short duration (1000ms) for non-critical messages
- **Descriptions**: Optional secondary text for context

Example:
```typescript
toast.success(`${product.name} adicionado ao carrinho!`, {
  description: 'Seu carrinho foi salvo automaticamente',
  duration: 1000,
});
```

## API Integration Patterns

### Async/Await
- **Try-Catch Blocks**: Always wrap async calls in error handling
- **Loading States**: Show loading indicators during API calls
- **Error Messages**: Display user-friendly error messages
- **Type Safety**: Define response types for API data

Example from shipping.ts:
```typescript
export async function calculateShipping(destinationCep: string): Promise<ShippingResult> {
  try {
    const cleanCep = destinationCep.replace(/\D/g, '');
    const destCoords = await getCEPCoordinates(cleanCep);
    
    if (!destCoords) {
      return {
        success: false,
        message: 'Entregamos apenas na Grande Florianópolis'
      };
    }
    
    return {
      success: true,
      value: shippingValue,
      distance: distance
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Erro ao calcular frete'
    };
  }
}
```

### Fetch API
- **Native Fetch**: Use browser fetch API for HTTP requests
- **JSON Parsing**: Always check response.ok before parsing
- **Error Handling**: Catch network errors and invalid responses
- **CORS**: Configure CORS headers for cross-origin requests

### Environment Variables
- **Vite Prefix**: Use `VITE_` prefix for client-side variables
- **Import Meta**: Access via `import.meta.env.VITE_VARIABLE_NAME`
- **Type Safety**: Define env types in vite-env.d.ts
- **Secrets**: Never commit .env.local files

## Data Structures

### Product Interface
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;           // Display format: "R$ 89,00"
  priceValue: number;      // Numeric value for calculations
  image: string;           // Primary image URL
  images?: string[];       // Optional carousel images (up to 10)
  featured?: boolean;      // Homepage highlight flag
  weight: string;
  ingredients: string[];
  tags: string[];          // 'vegano', 'sem-lactose', 'sem-gluten'
  deliveryOptions: string[];
}
```

### Cart Management
- **CartItem Structure**: `{ product: Product, quantity: number }`
- **Immutable Updates**: Always create new arrays/objects
- **Quantity Validation**: Check for zero quantity to remove items
- **Total Calculation**: Use reduce() for cart totals

### Category Organization
- **Static Categories**: Defined in App.tsx with id, name, icon, products
- **Dynamic Products**: Fetched from backend with fallback to static
- **Category Stories**: Separate data file for narrative content

## Performance Optimization

### Image Handling
- **Lazy Loading**: Use native loading="lazy" attribute
- **Responsive Images**: Provide multiple sizes for different viewports
- **CDN URLs**: Use Unsplash or S3 + CloudFront for images
- **Compression**: Automatic compression before S3 upload

### Code Splitting
- **Dynamic Imports**: Use React.lazy() for route-based splitting
- **Component Lazy Loading**: Load heavy components on demand
- **Vite Optimization**: Leverage Vite's automatic code splitting

### Memoization
- **useMemo**: Cache expensive calculations
- **useCallback**: Prevent unnecessary re-renders of child components
- **React.memo**: Wrap pure components for shallow comparison

## Error Handling

### User-Facing Errors
- **Toast Notifications**: Use toast.error() for user feedback
- **Fallback UI**: Show friendly error messages, not stack traces
- **Retry Options**: Provide ways to retry failed operations
- **Validation**: Validate user input before API calls

### Console Logging
- **Development Only**: Use console.log for debugging
- **Structured Logs**: Include context (function name, data)
- **Error Objects**: Log full error objects for debugging
- **Remove in Production**: Clean up console logs before deployment

## Accessibility

### ARIA Attributes
- **aria-label**: Provide labels for icon-only buttons
- **sr-only**: Screen reader only text for context
- **role**: Define semantic roles for custom components
- **aria-hidden**: Hide decorative elements from screen readers

### Keyboard Navigation
- **Tab Order**: Ensure logical tab order through interactive elements
- **Focus Styles**: Visible focus indicators for keyboard users
- **Keyboard Shortcuts**: Document shortcuts (e.g., Cmd+B for sidebar)
- **Escape Key**: Close modals/sheets with Escape key

### Semantic HTML
- **nav**: Use for navigation sections
- **main**: Wrap main content area
- **button**: Use for clickable actions, not divs
- **form**: Use for input collection

## Testing Patterns

### Manual Testing
- **Browser Testing**: Test in Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Test on real devices and emulators
- **Responsive Testing**: Check all breakpoints (mobile, tablet, desktop)
- **Cart Persistence**: Verify localStorage saves correctly

### Console Checks
- **No Errors**: Check browser console for errors
- **Network Tab**: Verify API calls succeed
- **Performance**: Check load times and bundle sizes

## Deployment Practices

### Build Process
- **npm run build**: Creates production build in /dist
- **Vite Optimization**: Minification, tree-shaking, code splitting
- **Environment Variables**: Use production .env values
- **Asset Hashing**: Automatic cache busting with hashed filenames

### AWS Deployment
- **S3 Upload**: Sync /dist to S3 bucket
- **CloudFront Invalidation**: Clear CDN cache after deployment
- **Lambda Functions**: Deploy backend separately with SAM
- **Monitoring**: Check CloudWatch logs after deployment

### Version Control
- **Git Commits**: Descriptive commit messages
- **Branch Strategy**: Feature branches, main for production
- **Pull Requests**: Code review before merging
- **.gitignore**: Exclude node_modules, .env.local, dist/

## Common Idioms

### Conditional Class Names
```typescript
className={`base-class ${condition ? 'active-class' : 'inactive-class'}`}
```

### Array Filtering and Mapping
```typescript
const filtered = products.filter(p => p.featured);
const names = products.map(p => p.name);
```

### Object Destructuring
```typescript
const { id, name, price } = product;
const { data, error } = await fetchProducts();
```

### Spread Operator for Immutability
```typescript
const updated = { ...product, price: newPrice };
const newArray = [...oldArray, newItem];
```

### Optional Chaining
```typescript
const image = product.images?.[0] || product.image;
const city = data?.localidade;
```

### Nullish Coalescing
```typescript
const value = userInput ?? defaultValue;
const open = openProp ?? _open;
```

## Brazilian Portuguese Conventions

### Language
- **UI Text**: All user-facing text in Brazilian Portuguese
- **Comments**: Code comments in Portuguese for local team
- **Variable Names**: English for code, Portuguese for display strings
- **Currency**: Format as "R$ XX,XX" with Brazilian Real symbol

### Date/Time
- **Format**: DD/MM/YYYY for dates
- **Time**: 24-hour format (e.g., "8h às 22h")
- **Locale**: Use 'pt-BR' for date/number formatting

### Address Format
- **CEP**: 8-digit postal code (e.g., "88010-001")
- **ViaCEP API**: Use for address lookup and validation
- **Delivery Area**: Grande Florianópolis region only
