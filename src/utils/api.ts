// Supabase serves the public catalog; checkout continues to use the AWS backend.
const AWS_API_URL = import.meta.env.VITE_AWS_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const USE_SUPABASE_CATALOG = Boolean(import.meta.env.VITE_SUPABASE_URL || SUPABASE_ANON_KEY);

const API_BASE = AWS_API_URL;
const USE_AWS = !!AWS_API_URL;

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  images?: string[];
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
    if (USE_SUPABASE_CATALOG) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      }
      const query = new URLSearchParams({
        select: 'id,name,description,price,priceValue:pricevalue,image,images,featured,weight,ingredients,tags,deliveryOptions:deliveryoptions',
        categoryid: `eq.${categoryId}`,
        order: 'created_at.asc,id.asc',
      });
      const response = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?${query}`, {
        headers: { apikey: SUPABASE_ANON_KEY },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Supabase catalog request failed (${response.status})`);
      }
      return await response.json();
    }
    if (!USE_AWS) return [];
    // Adiciona timestamp para evitar cache
    const timestamp = Date.now();
    const url = `${API_BASE}/products/${categoryId}${USE_AWS ? `?t=${timestamp}` : ''}`;

    const response = await fetchWithRetry(url, {
      headers: USE_AWS ? {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      } : {
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
  if (USE_SUPABASE_CATALOG || !USE_AWS) {
    console.error('Catalog changes require an authorized Supabase backend');
    return false;
  }
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
  if (USE_SUPABASE_CATALOG || !USE_AWS) {
    console.error('Catalog changes require an authorized Supabase backend');
    return null;
  }
  try {
    // Para AWS, usar POST /products com o ID existente (create.js faz upsert)
    if (USE_AWS) {
      const fullProduct = {
        ...updates,
        id: productId,
        categoryId: categoryId
      };

      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullProduct),
      });

      if (!response.ok) {
        console.error('Failed to update product:', await response.text());
        return null;
      }

      return await response.json();
    }

    // Para Supabase, usar PUT
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
  if (USE_SUPABASE_CATALOG || !USE_AWS) {
    console.error('Catalog changes require an authorized Supabase backend');
    return false;
  }
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
  if (USE_SUPABASE_CATALOG || !USE_AWS) {
    console.error('Catalog changes require an authorized Supabase backend');
    return false;
  }
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
  if (USE_SUPABASE_CATALOG || !USE_AWS) {
    return { success: false, error: 'Image uploads require an authorized Supabase backend' };
  }
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
