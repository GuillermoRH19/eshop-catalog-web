import axios from 'axios'

// Vive en Basket.API: ya tiene Postgres configurado y es quien identifica al cliente por
// nombre (ShoppingCart.UserName), así que el registro de "usuarios" se apoya en la misma base.
const API_BASE = import.meta.env.VITE_BASKET_API_URL || 'https://eshop-basket-api-dnu0.onrender.com'

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Customer {
  name: string
  createdAt: string
  isNew: boolean
}

// Crea el usuario en la base de datos si no existía, o lo reconoce si ya existía. No es login:
// no hay contraseña, el nombre es el identificador único de Basket y Orders.
export const switchUser = (name: string) =>
  http.post<Customer>('/customers', { name })
