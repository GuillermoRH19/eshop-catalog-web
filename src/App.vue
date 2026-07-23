<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">eShop <span class="logo-accent">Catalog</span></span>
        </div>
        <span class="api-badge">
          <span class="dot"></span>
          API Conectada
        </span>
      </div>
    </header>

    <!-- Main content -->
    <main class="main">
      <!-- Formulario de creación -->
      <ProductForm @created="loadProducts" />

      <!-- Buscador -->
      <SearchBar @search="onSearch" />

      <!-- Lista de productos -->
      <ProductList
        :products="filteredProducts"
        :loading="loading"
        @delete="onDelete"
      />

      <!-- Mensaje de error global -->
      <div v-if="globalError" class="global-error">
        ⚠️ {{ globalError }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ProductList from './components/ProductList.vue'
import ProductForm from './components/ProductForm.vue'
import { getProducts, deleteProductByName } from './api/productApi'
import type { Product } from './api/productApi'

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
const globalError = ref('')

// Filtro reactivo por nombre (client-side)
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function loadProducts() {
  loading.value = true
  globalError.value = ''
  try {
    const res = await getProducts()
    products.value = res.data.products ?? []
  } catch (err: any) {
    globalError.value = 'No se pudo conectar con la API. Verifica que el backend esté corriendo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  searchQuery.value = query
}

async function onDelete(id: string) {
  try {
    await deleteProductByName(id)
    products.value = products.value.filter(p => p.id !== id)
  } catch (err: any) {
    globalError.value = 'Error al eliminar el producto.'
    console.error(err)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
}

body {
  font-family: 'Inter', sans-serif;
  background: #0f0f1a;
  color: #e2e8f0;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(108, 99, 255, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
    #0f0f1a;
}
</style>

<style scoped>
.header {
  background: rgba(15, 15, 26, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
}

.logo-icon {
  font-size: 1.4rem;
}

.logo-accent {
  color: #6c63ff;
}

.api-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: #34d399;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #34d399;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.global-error {
  margin-top: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9rem;
}
</style>
