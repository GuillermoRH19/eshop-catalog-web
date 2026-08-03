<template>
  <div class="app">
    <BackgroundMesh :theme="theme" />

    <!-- ═══════════════════════════════════════
         NAVBAR
    ════════════════════════════════════════ -->
    <header class="navbar" :class="{ 'navbar-light': theme === 'light' }">
      <div class="navbar-inner">

        <!-- Logo -->
        <div class="logo">
          <div class="logo-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span class="logo-text">e<span class="logo-accent">Shop</span></span>
        </div>

        <!-- Search (center) -->
        <div class="navbar-search">
          <SearchBar @search="onSearch" />
        </div>

        <!-- Actions (right) -->
        <div class="navbar-actions">
          <!-- API badge -->
          <span class="api-badge">
            <span class="live-orb">
              <span class="live-orb-core" />
              <span class="live-orb-ring" />
            </span>
            <span class="api-badge-text">API Live</span>
          </span>

          <!-- Theme Toggle -->
          <button class="cart-btn" @click="toggleTheme" aria-label="Cambiar tema">
            <svg v-if="theme === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>

          <!-- Cart icon -->
          <button class="cart-btn" @click="showCart = !showCart" aria-label="Ver carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <Transition name="badge-pop">
              <span v-if="basketStore.itemsCount > 0" class="cart-badge">
                {{ basketStore.itemsCount > 99 ? '99+' : basketStore.itemsCount }}
              </span>
            </Transition>
          </button>

          <!-- Add product button -->
          <button class="btn-add" @click="showModal = true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════
         HERO BANNER
    ════════════════════════════════════════ -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-orb-deco" aria-hidden="true">
          <OrbLoader size="lg" color="purple" />
        </div>
        <div class="hero-text">
          <div class="hero-eyebrow">Catálogo 2026</div>
          <h1 class="hero-title">
            Descubre Tecnología<br/>
            <span class="hero-gradient">de Vanguardia</span>
          </h1>
          <p class="hero-subtitle">
            Encuentra los mejores productos tecnológicos al mejor precio.
            Calidad premium, entrega garantizada.
          </p>
          <div class="hero-cta-row">
            <button class="btn-hero-cta" @click="scrollToCatalog">
              Explorar catálogo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <span class="hero-stat">
              <strong>{{ products.length }}+</strong> productos disponibles
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         MAIN CONTENT
    ════════════════════════════════════════ -->
    <main class="main" ref="catalogRef">

      <!-- Category filter pills -->
      <div v-if="allCategories.length > 0" class="category-bar">
        <button
          v-for="cat in ['Todos', ...allCategories]"
          :key="cat"
          class="cat-pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >{{ cat }}</button>
      </div>

      <!-- Product Grid -->
      <ProductList
        :products="filteredProducts"
        :loading="loading"
        @delete="onDelete"
        @add-to-cart="basketStore.addToCart"
      />

      <!-- Global Error -->
      <Transition name="slide-up">
        <div v-if="globalError" class="global-error">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ globalError }}
          <button class="error-close" @click="globalError = ''">✕</button>
        </div>
      </Transition>
    </main>

    <!-- ═══════════════════════════════════════
         CART VIEW (full drawer)
    ════════════════════════════════════════ -->
    <CartView v-model:open="showCart" />

    <!-- ═══════════════════════════════════════
         PRODUCT FORM MODAL (Drawer)
    ════════════════════════════════════════ -->
    <ProductFormModal
      v-model:open="showModal"
      @created="loadProducts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BackgroundMesh from './components/BackgroundMesh.vue'
import SearchBar from './components/SearchBar.vue'
import ProductList from './components/ProductList.vue'
import ProductFormModal from './components/ProductFormModal.vue'
import CartView from './components/CartView.vue'
import OrbLoader from './components/OrbLoader.vue'
import { getProducts, deleteProductByName } from './api/productApi'
import type { Product } from './api/productApi'
import { useBasketStore } from './store/basketStore'

// ── Store ──
const basketStore = useBasketStore()

// ── State ──
const theme          = ref('dark')
const products       = ref<Product[]>([])
const loading        = ref(false)
const searchQuery    = ref('')
const globalError    = ref('')
const showModal      = ref(false)
const showCart       = ref(false)
const activeCategory = ref('Todos')
const catalogRef     = ref<HTMLElement | null>(null)

// ── Derived data ──
const allCategories = computed(() => {
  const set = new Set<string>()
  products.value.forEach(p => p.category?.forEach(c => set.add(c)))
  return Array.from(set).sort()
})

const filteredProducts = computed(() => {
  let list = products.value

  // Category filter
  if (activeCategory.value !== 'Todos') {
    list = list.filter(p => p.category?.includes(activeCategory.value))
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }

  return list
})

// ── API functions ──
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

async function onDelete(id: string) {
  try {
    await deleteProductByName(id)
    products.value = products.value.filter(p => p.id !== id)
  } catch (err: any) {
    globalError.value = 'Error al eliminar el producto.'
    console.error(err)
  }
}

// ── Misc ──
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.className = theme.value
  localStorage.setItem('theme', theme.value)
}

function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) {
    theme.value = saved
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme.value = 'light'
  } else {
    theme.value = 'dark'
  }
  document.documentElement.className = theme.value
}

function onSearch(query: string) {
  searchQuery.value = query
}

function scrollToCatalog() {
  catalogRef.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  initTheme()
  loadProducts()
  basketStore.fetchBasket()
})
</script>

<style scoped>
/* ── App Shell ── */
.app {
  min-height: 100vh;
  position: relative;
}

/* ═══════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.3s;
}

.navbar-light {
  background: rgba(248, 250, 252, 0.88);
}

.navbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.85rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  flex-shrink: 0;
}

.logo-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--purple), var(--violet));
  box-shadow: var(--glow-purple);
  color: #fff;
  flex-shrink: 0;
}

.logo-accent {
  background: linear-gradient(90deg, var(--purple), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Center search */
.navbar-search {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
}

/* Override SearchBar margin */
.navbar-search :deep(.search-bar) { margin-bottom: 0; }

/* Right actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* API badge */
.api-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: var(--green-neon);
  font-size: 0.74rem;
  font-weight: 600;
}

.api-badge-text { display: none; }
@media (min-width: 900px) { .api-badge-text { display: inline; } }

/* Live Orb */
.live-orb { position: relative; display: flex; width: 10px; height: 10px; }
.live-orb-core {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--green-neon);
  box-shadow: 0 0 6px var(--green-neon), 0 0 12px rgba(52,211,153,0.5);
  animation: orb-core-pulse 2s ease-in-out infinite;
}
.live-orb-ring {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 10px; height: 10px; border-radius: 50%;
  border: 1.5px solid var(--green-neon);
  animation: orb-ring-expand 2s ease-out infinite;
}
@keyframes orb-core-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--green-neon), 0 0 12px rgba(52,211,153,0.5); }
  50%       { opacity: 0.75; box-shadow: 0 0 10px var(--green-neon), 0 0 24px rgba(52,211,153,0.7); }
}
@keyframes orb-ring-expand {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
  100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
}

/* Cart button */
.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.cart-btn:hover {
  background: rgba(108, 99, 255, 0.15);
  border-color: rgba(108, 99, 255, 0.35);
  color: var(--purple);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.2);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, var(--purple), var(--cyan));
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(108, 99, 255, 0.6);
  border: 1.5px solid var(--bg-deep);
}

/* Add product button */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--purple) 0%, var(--violet) 100%);
  color: #fff;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.2s, box-shadow 0.25s, transform 0.12s;
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.3);
  white-space: nowrap;
}
.btn-add:hover {
  box-shadow: var(--glow-purple), 0 4px 14px rgba(108, 99, 255, 0.4);
  opacity: 0.9;
}
.btn-add:active { transform: scale(0.97); }

/* ═══════════════════════════════════════
   HERO
════════════════════════════════════════ */
.hero {
  border-bottom: 1px solid var(--glass-border);
  background: linear-gradient(180deg, rgba(108,99,255,0.04) 0%, transparent 100%);
}

.hero-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 1.75rem 4.5rem;
  display: flex;
  align-items: center;
  gap: 3rem;
}

.hero-orb-deco {
  flex-shrink: 0;
  display: none;
}
@media (min-width: 768px) { .hero-orb-deco { display: flex; } }

.hero-text { flex: 1; }

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--purple);
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  margin-bottom: 1.25rem;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.hero-gradient {
  background: linear-gradient(90deg, var(--purple), var(--cyan), var(--violet));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: text-shimmer 4s linear infinite;
}

@keyframes text-shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 0 2rem;
}

.hero-cta-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.btn-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.8rem 1.75rem;
  border: none;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%);
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.12s;
  box-shadow: 0 6px 20px rgba(108, 99, 255, 0.35);
}
.btn-hero-cta:hover {
  box-shadow: var(--glow-purple), var(--glow-cyan), 0 8px 30px rgba(108,99,255,0.5);
  transform: translateY(-1px);
}
.btn-hero-cta:active { transform: translateY(0) scale(0.98); }

.hero-stat {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.hero-stat strong { color: var(--text-primary); font-weight: 700; }

/* ═══════════════════════════════════════
   MAIN / CATALOG
════════════════════════════════════════ */
.main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 1.75rem 5rem;
}

/* ── Category Pills ── */
.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cat-pill:hover {
  background: rgba(108, 99, 255, 0.12);
  border-color: rgba(108, 99, 255, 0.3);
  color: #c4b5fd;
}

.cat-pill.active {
  background: linear-gradient(135deg, rgba(108,99,255,0.25), rgba(6,182,212,0.15));
  border-color: rgba(108, 99, 255, 0.45);
  color: #e0d9ff;
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.2);
}

/* ── Global Error ── */
.global-error {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-md);
  padding: 0.9rem 1.25rem;
  color: var(--red-neon);
  font-size: 0.9rem;
  backdrop-filter: blur(12px);
}
.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--red-neon);
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.85rem;
  transition: opacity 0.2s;
  padding: 0;
}
.error-close:hover { opacity: 1; }

/* ═══════════════════════════════════════
   TRANSITIONS
════════════════════════════════════════ */
.slide-up-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Cart badge pop */
.badge-pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-pop-leave-active { transition: all 0.15s ease; }
.badge-pop-enter-from, .badge-pop-leave-to { opacity: 0; transform: scale(0.4); }
</style>
