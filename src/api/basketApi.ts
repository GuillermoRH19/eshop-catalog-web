import axios from 'axios'

const API_BASE = import.meta.env.VITE_BASKET_API_URL || 'https://eshop-basket-api-dnu0.onrender.com'

console.log('[basketApi] Basket.API base URL:', API_BASE)

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  console.log(`[basketApi] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ?? '')
  return config
})

http.interceptors.response.use(
  (response) => {
    console.log(`[basketApi] ← ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error(`[basketApi] ✕ Timeout esperando respuesta de ${error.config?.url}`)
    } else if (error.response) {
      console.error(`[basketApi] ✕ ${error.response.status} ${error.config?.url}`, error.response.data)
    } else {
      console.error(`[basketApi] ✕ Sin respuesta del servidor (${error.config?.url}). ¿Basket.API está caído?`, error.message)
    }
    return Promise.reject(error)
  }
)

export interface ShoppingCartItem {
  quantity: number
  color: string
  price: number
  productId: string
  productName: string
  imageFiles?: string // Optional for UI display purposes
}

export interface ShoppingCart {
  userName: string
  items: ShoppingCartItem[]
  totalPrice?: number
}

export interface GetBasketResponse {
  cart: ShoppingCart
}

export interface StoreBasketRequest {
  cart: ShoppingCart
}

export interface StoreBasketResponse {
  userName: string
}

// Obtener el carrito de un usuario
export const getBasket = (userName: string) =>
  http.get<GetBasketResponse>(`/basket/${userName}`)

// Guardar/Actualizar el carrito completo
export const storeBasket = (data: StoreBasketRequest) =>
  http.post<StoreBasketResponse>('/basket', data)

// Eliminar el carrito de un usuario
export const deleteBasket = (userName: string) =>
  http.delete(`/basket/${userName}`)
