import axios from 'axios'

const API_BASE = import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:5272'

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  console.log(`[ordersApi] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ?? '')
  return config
})

http.interceptors.response.use(
  (response) => {
    console.log(`[ordersApi] ← ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error(`[ordersApi] ✕ Timeout esperando respuesta de ${error.config?.url}`)
    } else if (error.response) {
      console.error(`[ordersApi] ✕ ${error.response.status} ${error.config?.url}`, error.response.data)
    } else {
      console.error(`[ordersApi] ✕ Sin respuesta del servidor (${error.config?.url}). ¿Orders.API está caído?`, error.message)
    }
    return Promise.reject(error)
  }
)

export interface OrderItem {
  productId: string
  // Código corto derivado del productId (últimos 8 hex, mayúsculas) — para mostrar, no para
  // buscar: el productId completo sigue siendo la clave real.
  productRef: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled'

export interface Order {
  id: string
  // "ORD-XXXXXXXX", derivado del id — lo que se le muestra a un humano en vez del GUID completo.
  orderNumber: string
  customerId: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
}

// Genera una orden a partir del Basket del cliente. El Idempotency-Key evita duplicar la orden
// si el request se reintenta (doble clic, retry de red, etc).
export const createOrder = (customerId: string, idempotencyKey: string) =>
  http.post<Order>(
    '/api/orders',
    { customerId },
    { headers: { 'Idempotency-Key': idempotencyKey } }
  )

export const getOrderById = (id: string) => http.get<Order>(`/api/orders/${id}`)

export const getOrdersByCustomer = (customerId: string) =>
  http.get<{ orders: Order[] }>(`/api/orders/customer/${customerId}`)

// Vista admin: todas las órdenes de todos los clientes.
export const getAllOrders = () =>
  http.get<{ orders: Order[] }>('/api/orders')

// Transiciones permitidas por el backend: Pending -> Confirmed, Pending -> Cancelled.
// Cualquier otra combinación responde 400/409 (ver OrderStatusActions.vue).
export const updateOrderStatus = (id: string, status: 'Confirmed' | 'Cancelled') =>
  http.patch<Order>(`/api/orders/${id}/status`, { status })

// URL directa al comprobante en PDF (se usa en un <a href> normal, no hace falta pasar por axios).
export const getOrderPdfUrl = (id: string) => `${API_BASE}/api/orders/${id}/pdf`
