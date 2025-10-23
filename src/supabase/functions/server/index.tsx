// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize storage bucket on startup
const BUCKET_NAME = 'make-c42493b2-products';

async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB limit
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize storage on startup
initializeStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c42493b2/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all products for a category
app.get("/make-server-c42493b2/products/:categoryId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const products = await kv.get(`products:${categoryId}`);
    
    if (!products) {
      return c.json({ products: [] });
    }
    
    return c.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products", details: error.message }, 500);
  }
});

// Get all categories with products
app.get("/make-server-c42493b2/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories", details: error.message }, 500);
  }
});

// Update products for a category
app.post("/make-server-c42493b2/products/:categoryId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const { products } = await c.req.json();
    
    await kv.set(`products:${categoryId}`, products);
    
    return c.json({ success: true, message: "Products updated successfully" });
  } catch (error) {
    console.error("Error updating products:", error);
    return c.json({ error: "Failed to update products", details: error.message }, 500);
  }
});

// Update a single product
app.put("/make-server-c42493b2/product/:categoryId/:productId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const productId = c.req.param("productId");
    const updatedProduct = await c.req.json();
    
    const products = await kv.get(`products:${categoryId}`) || [];
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex === -1) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    products[productIndex] = { ...products[productIndex], ...updatedProduct };
    await kv.set(`products:${categoryId}`, products);
    
    return c.json({ success: true, product: products[productIndex] });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Failed to update product", details: error.message }, 500);
  }
});

// Delete a product
app.delete("/make-server-c42493b2/product/:categoryId/:productId", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const productId = c.req.param("productId");
    
    const products = await kv.get(`products:${categoryId}`) || [];
    const filteredProducts = products.filter((p: any) => p.id !== productId);
    
    await kv.set(`products:${categoryId}`, filteredProducts);
    
    return c.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "Failed to delete product", details: error.message }, 500);
  }
});

// Initialize products from frontend data (run once)
app.post("/make-server-c42493b2/init-products", async (c) => {
  try {
    const { categories } = await c.req.json();
    
    for (const category of categories) {
      await kv.set(`products:${category.id}`, category.products);
      await kv.set(`category:${category.id}`, {
        id: category.id,
        name: category.name
      });
    }
    
    return c.json({ success: true, message: "Products initialized successfully" });
  } catch (error) {
    console.error("Error initializing products:", error);
    return c.json({ error: "Failed to initialize products", details: error.message }, 500);
  }
});

// Upload product image
app.post("/make-server-c42493b2/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `product-${timestamp}-${randomStr}.${extension}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: "Failed to upload image", details: error.message }, 500);
    }

    // Generate signed URL (valid for 10 years)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filename, 315360000); // 10 years in seconds

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: "Failed to generate signed URL", details: signedUrlError.message }, 500);
    }

    return c.json({ 
      success: true, 
      imageUrl: signedUrlData.signedUrl,
      filename: filename
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json({ error: "Failed to upload image", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);