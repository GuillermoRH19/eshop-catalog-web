import axios from 'axios'
import type { Product } from './productApi'

const API_BASE = import.meta.env.VITE_BASKET_API_URL || 'https://eshop-basket-api-dnu0.onrender.com'

const http = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

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
