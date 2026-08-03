import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBasket, storeBasket, deleteBasket, type ShoppingCart } from '../api/basketApi'
import type { Product } from '../api/productApi'

// Identifica el carrito del visitante entre sesiones (Basket.API indexa por userName).
function getOrCreateUserName(): string {
  const STORAGE_KEY = 'eshop_username'
  let userName = localStorage.getItem(STORAGE_KEY)
  if (!userName) {
    userName = `guest-${crypto.randomUUID()}`
    localStorage.setItem(STORAGE_KEY, userName)
  }
  return userName
}

export const useBasketStore = defineStore('basket', () => {
  // State
  const cart = ref<ShoppingCart>({
    userName: getOrCreateUserName(),
    items: []
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const cartItems = computed(() => cart.value.items)
  const cartTotal = computed(() => cart.value.items.reduce((total, item) => total + (item.price * item.quantity), 0))
  const itemsCount = computed(() => cart.value.items.reduce((count, item) => count + item.quantity, 0))

  // Sincroniza el carrito actual con el backend. No lanza: solo reporta el error,
  // porque el estado local (ya actualizado de forma optimista) es la fuente de
  // verdad para la UI mientras el backend esté lento o caído.
  async function syncCart() {
    try {
      await storeBasket({ cart: cart.value })
      error.value = null
    } catch (e: any) {
      console.error('[basketStore] No se pudo sincronizar el carrito con Basket.API:', e)
      error.value = 'No se pudo sincronizar el carrito con el servidor. Tus cambios se guardaron localmente.'
    }
  }

  // Actions
  async function fetchBasket() {
    loading.value = true
    error.value = null
    try {
      const response = await getBasket(cart.value.userName)
      if (response.data && response.data.cart) {
        cart.value = response.data.cart
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        // Carrito nuevo: no es un error, simplemente no existe todavía en el backend.
        console.log('[basketStore] Carrito no encontrado en backend (usuario nuevo), se usará uno vacío.')
      } else {
        console.error('[basketStore] Error obteniendo el carrito:', e)
        error.value = 'No se pudo obtener el carrito desde el servidor. Mostrando carrito local.'
      }
    } finally {
      loading.value = false
    }
  }

  async function addToCart(product: Product) {
    error.value = null

    // 1. Actualizar el estado local de inmediato (optimista) para que la UI
    //    responda aunque el backend esté caído o tarde en contestar.
    const newItems = [...cart.value.items]
    const existingItemIndex = newItems.findIndex(i => i.productId === product.id)
    if (existingItemIndex > -1) {
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      }
    } else {
      newItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        color: 'default',
        quantity: 1,
        imageFiles: product.imageFiles
      })
    }
    cart.value = { ...cart.value, items: newItems }
    console.log('[basketStore] Producto agregado localmente:', product.name)

    // 2. Intentar reflejarlo en el backend, sin bloquear ni revertir la UI si falla.
    loading.value = true
    await syncCart()
    loading.value = false
  }

  async function removeFromCart(productId: string) {
    error.value = null

    const newItems = cart.value.items.filter(i => i.productId !== productId)
    cart.value = { ...cart.value, items: newItems }
    console.log('[basketStore] Producto eliminado localmente:', productId)

    loading.value = true
    await syncCart()
    loading.value = false
  }

  async function emptyCart() {
    error.value = null
    cart.value = { ...cart.value, items: [] }

    loading.value = true
    try {
      await deleteBasket(cart.value.userName)
    } catch (e: any) {
      console.error('[basketStore] No se pudo vaciar el carrito en el servidor:', e)
      error.value = 'No se pudo vaciar el carrito en el servidor. Se vació localmente.'
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
