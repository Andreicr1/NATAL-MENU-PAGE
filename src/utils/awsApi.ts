const API_URL = import.meta.env.VITE_AWS_API_URL || '';

interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  weight: string;
  ingredients: string[];
  tags: string[];
  deliveryOptions: string[];
  featured?: boolean;
}

interface Order {
  orderId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: any;
  items: any[];
  total: number;
  status: string;
  paymentIntentId: string;
  paymentStatus: string;
  createdAt: number;
}

interface Inventory {
  productId: string;
  quantity: number;
}

// Products
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/${categoryId}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
}

// Inventory
export async function getInventory(productId: string): Promise<Inventory> {
  const response = await fetch(`${API_URL}/inventory/${productId}`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export async function updateInventory(
  productId: string,
  quantity: number,
  operation: 'set' | 'increment' | 'decrement'
): Promise<Inventory> {
  const response = await fetch(`${API_URL}/inventory/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, operation })
  });
  if (!response.ok) throw new Error('Failed to update inventory');
  return response.json();
}

// Orders
export async function createOrder(orderData: {
  items: any[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: any;
  shippingCost?: number;
  deliveryType?: 'express' | 'scheduled' | '';
  scheduledDate?: string;
}): Promise<{ order: Order }> {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
}

// Mercado Pago
export async function createPaymentPreference(data: {
  items: any[];
  payer: { name: string; email: string; phone?: string };
  backUrls?: { success?: string; failure?: string; pending?: string; webhook?: string };
  auto_return?: string;
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  metadata?: any;
}): Promise<{ id: string; initPoint: string; sandboxInitPoint: string; externalReference?: string }> {
  const response = await fetch(`${API_URL}/payments/preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to create payment preference');
  }
  return response.json();
}

export async function getPaymentStatus(paymentId: string): Promise<any> {
  const response = await fetch(`${API_URL}/payments/${paymentId}`);
  if (!response.ok) throw new Error('Failed to get payment status');
  return response.json();
}

export async function createPixPayment(data: {
  transaction_amount: number;
  description: string;
  payer: {
    email: string;
    name: string;
    identification?: { type: string; number: string };
  };
  external_reference: string;
  notification_url: string;
}): Promise<{
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url?: string;
}> {
  const response = await fetch(`${API_URL}/payments/pix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create PIX payment');
  }
  return response.json();
}

export async function getOrders(filters?: {
  status?: string;
  startDate?: number;
  endDate?: number;
}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate.toString());
  if (filters?.endDate) params.append('endDate', filters.endDate.toString());

  const response = await fetch(`${API_URL}/orders?${params}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function getOrderStatus(orderId: string): Promise<{
  orderId: string;
  status: string;
  paymentStatus?: string;
  paymentStatusDetail?: string;
  paymentId?: string;
  paymentMethod?: string;
  total?: number;
  createdAt?: number;
  updatedAt?: number;
  paymentApprovedAt?: number;
}> {
  const response = await fetch(`${API_URL}/orders/${orderId}/status`);
  if (!response.ok) throw new Error('Failed to fetch order status');
  return response.json();
}

export async function searchOrders(searchTerm: string): Promise<{
  count: number;
  searchTerm: string;
  orders: Array<{
    orderId: string;
    orderNumber?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: any[];
    total: number;
    status: string;
    paymentStatus?: string;
    paymentId?: string;
    transactionId?: string;
    externalReference?: string;
    shippingAddress?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    shippingCost?: number;
    paymentMethod?: string;
    createdAt: number;
    updatedAt: number;
  }>;
}> {
  const response = await fetch(`${API_URL}/orders/search?q=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) throw new Error('Failed to search orders');
  return response.json();
}
