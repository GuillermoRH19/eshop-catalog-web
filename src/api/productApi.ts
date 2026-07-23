import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://eshop-catalog-api-f2ys.onrender.com'

const http = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Product {
  id: string
  name: string
  description: string
  category: string[]
  imageFiles: string
  price: number
}

export interface CreateProductRequest {
  name: string
  description: string
  category: string[]
  imageFiles: string
  price: number
}

export interface ProductsResponse {
  products: Product[]
}

// Obtener todos los productos (con paginación y filtros opcionales)
export const getProducts = (pageIndex = 0, pageSize = 10, nameFilter = '') =>
  http.get<ProductsResponse>('/products', {
    params: {
      pageIndex,
      pageSize,
      name: nameFilter || undefined
    }
  })

// Buscar productos por nombre
export const searchByName = (name: string) =>
  http.get<ProductsResponse>('/products', { params: { name } })

// Crear un nuevo producto
export const createProduct = (data: CreateProductRequest) =>
  http.post<{ id: string }>('/products', data)

// Actualizar un producto por su ID
export const updateProductByName = (id: string, data: Partial<CreateProductRequest>) =>
  http.put(`/products/${id}`, data)

// Eliminar un producto por su ID
export const deleteProductByName = (id: string) =>
  http.delete(`/products/${id}`)
