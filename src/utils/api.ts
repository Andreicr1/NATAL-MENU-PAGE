// Supabase configuration - Temporarily using hardcoded keys
// TODO: Replace with environment variables when .env.local is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mypdmnucmkigqshafrwx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGRtbnVjbWtpZ3FzaGFmcnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTAxNzMsImV4cCI6MjA3NjM4NjE3M30.LTzyrfI4unf-KkhRktZyEQCPUoWphpWAo4U0kQ2Y5u8';

const API_BASE = `${SUPABASE_URL}/functions/v1/make-server-c42493b2`;

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  featured?: boolean;
  weight: string;
  ingredients: string[];
  tags: string[];
  deliveryOptions: string[];
}

interface Category {
  id: string;
  name: string;
}

// Fetch products for a specific category
export async function fetchProducts(categoryId: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch products:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Update products for a category
export async function updateProducts(categoryId: string, products: Product[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/products/${categoryId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ products }),
    });
    
    if (!response.ok) {
      console.error('Failed to update products:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating products:', error);
    return false;
  }
}

// Update a single product
export async function updateProduct(categoryId: string, productId: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE}/product/${categoryId}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      console.error('Failed to update product:', await response.text());
      return null;
    }
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete a product
export async function deleteProduct(categoryId: string, productId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/product/${categoryId}/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      console.error('Failed to delete product:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// Initialize products (run once to migrate from static data to backend)
export async function initializeProducts(categories: Array<{ id: string; name: string; products: Product[] }>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/init-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ categories }),
    });
    
    if (!response.ok) {
      console.error('Failed to initialize products:', await response.text());
      return false;
    }
    
    const data = await response.json();
    console.log('Products initialized:', data.message);
    return true;
  } catch (error) {
    console.error('Error initializing products:', error);
    return false;
  }
}

// Upload product image
export async function uploadProductImage(file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to upload image:', errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    return { success: true, imageUrl: data.imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: String(error) };
  }
}