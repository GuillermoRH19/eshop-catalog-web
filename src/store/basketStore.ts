import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBasket, storeBasket, deleteBasket, type ShoppingCart } from '../api/basketApi'
import type { Product } from '../api/productApi'

export const useBasketStore = defineStore('basket', () => {
  // State
  const cart = ref<ShoppingCart>({
    userName: 'default-user',
    items: []
  })
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const cartItems = computed(() => cart.value.items)
  const cartTotal = computed(() => cart.value.items.reduce((total, item) => total + (item.price * item.quantity), 0))
  const itemsCount = computed(() => cart.value.items.reduce((count, item) => count + item.quantity, 0))

  // Actions
  async function fetchBasket() {
    loading.value = true
    error.value = null
    try {
      const response = await getBasket(cart.value.userName)
      // Si el carrito no existe en backend (error 404), la API devolverá un error. 
      // Por ende, solo actualizamos si hay éxito y viene cart.
      if (response.data && response.data.cart) {
        cart.value = response.data.cart
      }
    } catch (e: any) {
      if (e.response?.status !== 404) {
        error.value = 'No se pudo obtener el carrito'
      }
    } finally {
      loading.value = false
    }
  }

  async function addToCart(product: Product) {
    loading.value = true
    error.value = null
    try {
      // 1. Clonar los items actuales
      const newItems = [...cart.value.items]
      
      // 2. Revisar si ya existe el producto
      const existingItemIndex = newItems.findIndex(i => i.productId === product.id)
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += 1
      } else {
        newItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          color: 'default',
          quantity: 1,
          imageFiles: product.imageFiles // Guardamos para la UI temporalmente (aunque no sea parte estricta del backend)
        })
      }

      // 3. Crear el payload
      const payload = {
        cart: {
          userName: cart.value.userName,
          items: newItems
        }
      }

      // 4. Enviar a backend
      await storeBasket(payload)
      
      // 5. Reflejar en el estado local
      cart.value.items = newItems

    } catch (e: any) {
      error.value = 'Hubo un error al agregar al carrito'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function removeFromCart(productId: string) {
    loading.value = true
    error.value = null
    try {
      const newItems = cart.value.items.filter(i => i.productId !== productId)
      
      const payload = {
        cart: {
          userName: cart.value.userName,
          items: newItems
        }
      }

      await storeBasket(payload)
      cart.value.items = newItems
    } catch (e: any) {
      error.value = 'Hubo un error al eliminar el producto'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function emptyCart() {
    loading.value = true
    error.value = null
    try {
      await deleteBasket(cart.value.userName)
      cart.value.items = []
    } catch (e: any) {
      error.value = 'Hubo un error al vaciar el carrito'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    cart,
    loading,
    error,
    cartItems,
    cartTotal,
    itemsCount,
    fetchBasket,
    addToCart,
    removeFromCart,
    emptyCart
  }
})
