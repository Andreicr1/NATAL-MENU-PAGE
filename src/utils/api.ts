// API configuration - AWS backend
const AWS_API_URL = import.meta.env.VITE_AWS_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mypdmnucmkigqshafrwx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGRtbnVjbWtpZ3FzaGFmcnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTAxNzMsImV4cCI6MjA3NjM4NjE3M30.LTzyrfI4unf-KkhRktZyEQCPUoWphpWAo4U0kQ2Y5u8';

// Use AWS API if configured, otherwise fallback to Supabase
const API_BASE = AWS_API_URL || `${SUPABASE_URL}/functions/v1/make-server-c42493b2`;
const USE_AWS = !!AWS_API_URL;

console.log('API Configuration:', { API_BASE, USE_AWS });

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

// Helper para retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (i === retries) return response;
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

// Fetch products for a specific category
export async function fetchProducts(categoryId: string): Promise<Product[]> {
  try {
    const response = await fetchWithRetry(`${API_BASE}/products/${categoryId}`, {
      headers: USE_AWS ? {} : {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch products:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.products || []);
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
      headers: USE_AWS ? {
        'Content-Type': 'application/json',
      } : {
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
    const endpoint = USE_AWS ? `${API_BASE}/products/${productId}` : `${API_BASE}/product/${categoryId}/${productId}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: USE_AWS ? {
        'Content-Type': 'application/json',
      } : {
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
    const endpoint = USE_AWS ? `${API_BASE}/products/${productId}` : `${API_BASE}/product/${categoryId}/${productId}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: USE_AWS ? {} : {
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
    if (USE_AWS) {
      // AWS: Create products individually
      for (const category of categories) {
        for (const product of category.products) {
          const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, categoryId: category.id }),
          });
          if (!response.ok) {
            console.error('Failed to create product:', await response.text());
          }
        }
      }
      return true;
    } else {
      // Supabase: Batch initialization
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
    }
  } catch (error) {
    console.error('Error initializing products:', error);
    return false;
  }
}

// Upload product image
export async function uploadProductImage(file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    if (USE_AWS) {
      // AWS: Get presigned URL first
      const presignedResponse = await fetch(`${API_BASE}/upload/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      
      if (!presignedResponse.ok) {
        return { success: false, error: 'Failed to get presigned URL' };
      }
      
      const { uploadUrl, fileUrl } = await presignedResponse.json();
      
      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      
      if (!uploadResponse.ok) {
        return { success: false, error: 'Failed to upload to S3' };
      }
      
      return { success: true, imageUrl: fileUrl };
    } else {
      // Supabase: Direct upload
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
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: String(error) };
  }
}