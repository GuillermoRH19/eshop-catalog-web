<template>
  <div
    class="product-card"
    :style="{ '--delay': delay }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- ── Admin menu (three dots) ── -->
    <div class="admin-menu" @click.stop>
      <button class="admin-trigger" @click="menuOpen = !menuOpen" :aria-label="`Opciones de ${product.name}`">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      <Transition name="menu-pop">
        <div v-if="menuOpen" class="admin-dropdown" v-click-outside="() => (menuOpen = false)">
          <button class="dropdown-item item-danger" @click="onDelete" :disabled="deleting">
            <span v-if="deleting" class="mini-spinner" />
            <template v-else>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
              Eliminar producto
            </template>
          </button>
        </div>
      </Transition>
    </div>

    <!-- ── Image ── -->
    <div class="card-image-wrap">
      <img
        v-if="product.imageFiles && !imgError"
        :src="product.imageFiles"
        :alt="product.name"
        class="card-image"
        :class="{ zoomed: hovered }"
        @error="imgError = true"
      />
      <div v-else class="card-image-placeholder">
        <OrbLoader size="sm" color="purple" />
      </div>
      <!-- Gradient overlay -->
      <div class="img-overlay" />
      <!-- Price badge -->
      <div class="price-badge">${{ product.price.toFixed(2) }}</div>
    </div>

    <!-- ── Content ── -->
    <div class="card-content">
      <!-- Categories -->
      <div v-if="product.category?.length" class="card-cats">
        <span
          v-for="(cat, ci) in product.category.slice(0, 2)"
          :key="cat"
          class="cat-badge"
          :class="`cat-hue-${ci % 4}`"
        >{{ cat }}</span>
        <span v-if="product.category.length > 2" class="cat-badge cat-more">
          +{{ product.category.length - 2 }}
        </span>
      </div>

      <h3 class="card-name">{{ product.name }}</h3>
      <p v-if="product.description" class="card-desc">{{ product.description }}</p>
    </div>

    <!-- ── Footer: Add to Cart ── -->
    <div class="card-footer">
      <button
        class="btn-cart"
        :class="{ added: justAdded }"
        @click="onAddToCart"
        :aria-label="`Añadir ${product.name} al carrito`"
      >
        <Transition name="icon-swap" mode="out-in">
          <svg v-if="!justAdded" key="cart" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <svg v-else key="check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </Transition>
        <span>{{ justAdded ? '¡Añadido!' : 'Añadir al carrito' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '../api/productApi'
import OrbLoader from './OrbLoader.vue'

const props = defineProps<{
  product: Product
  delay?: string
}>()

const emit = defineEmits<{
  (e: 'add-to-cart', product: Product): void
  (e: 'delete', id: string): void
}>()

// ── State ──
const hovered   = ref(false)
const menuOpen  = ref(false)
const deleting  = ref(false)
const imgError  = ref(false)
const justAdded = ref(false)

// ── Click-outside directive (WeakMap — type-safe) ──
const _coHandlers = new WeakMap<HTMLElement, (e: MouseEvent) => void>()
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    const handler = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value(e)
    }
    _coHandlers.set(el, handler)
    document.addEventListener('click', handler)
  },
  unmounted(el: HTMLElement) {
    const handler = _coHandlers.get(el)
    if (handler) document.removeEventListener('click', handler)
    _coHandlers.delete(el)
  }
}

function onAddToCart() {
  emit('add-to-cart', props.product)
  justAdded.value = true
  setTimeout(() => { justAdded.value = false }, 1800)
}

function onDelete() {
  if (!confirm(`¿Eliminar "${props.product.name}"?`)) return
  deleting.value = true
  menuOpen.value = false
  emit('delete', props.product.id)
  setTimeout(() => { deleting.value = false }, 1500)
}
</script>

<style scoped>
/* ── Card Shell ── */
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: visible; /* needed for dropdown */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
  animation: card-enter 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  animation-delay: var(--delay, 0ms);
  /* clip inner overflow without clipping dropdown */
  isolation: isolate;
}

.product-card:hover {
  border-color: rgba(108, 99, 255, 0.4);
  box-shadow:
    0 0 0 1px rgba(108, 99, 255, 0.1),
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 25px rgba(108, 99, 255, 0.12);
  transform: translateY(-4px);
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Admin Menu ── */
.admin-menu {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
}

.admin-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.admin-trigger:hover {
  background: rgba(108, 99, 255, 0.2);
  border-color: rgba(108, 99, 255, 0.4);
  color: #c4b5fd;
}

.admin-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 0.35rem;
  min-width: 160px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.item-danger { color: rgba(248, 113, 113, 0.75); }
.item-danger:hover { background: rgba(239, 68, 68, 0.15); color: var(--red-neon); }
.item-danger:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Image ── */
.card-image-wrap {
  position: relative;
  height: 200px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.card-image.zoomed { transform: scale(1.06); }

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(108,99,255,0.07), rgba(6,182,212,0.05));
}

.img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%);
  pointer-events: none;
}

/* ── Price Badge ── */
.price-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
  background: var(--glass-bg);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: var(--green-neon);
  font-size: 0.92rem;
  font-weight: 800;
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.2);
  letter-spacing: 0.01em;
}

/* ── Content ── */
.card-content {
  flex: 1;
  padding: 1rem 1.15rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.card-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.cat-badge {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.18rem 0.52rem;
  border-radius: 999px;
  letter-spacing: 0.03em;
}
.cat-hue-0 { background: rgba(108,99,255,0.18); border: 1px solid rgba(108,99,255,0.3); color: #a5b4fc; }
.cat-hue-1 { background: rgba(6,182,212,0.15);  border: 1px solid rgba(6,182,212,0.28);  color: #67e8f9; }
.cat-hue-2 { background: rgba(217,70,239,0.15); border: 1px solid rgba(217,70,239,0.28); color: #e879f9; }
.cat-hue-3 { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.28); color: #fcd34d; }
.cat-more  { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: var(--text-muted); }

.card-name {
  font-size: 0.97rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Footer ── */
.card-footer {
  padding: 0.75rem 1.15rem 1rem;
  border-top: 1px solid var(--glass-border);
}

/* ── Add to Cart Button ── */
.btn-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%);
  color: #fff;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.2s, box-shadow 0.3s, transform 0.12s;
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-cart::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.25s;
}

.btn-cart:hover::before { opacity: 1; }

.btn-cart:hover {
  box-shadow: 0 0 0 2px rgba(108,99,255,0.3), 0 6px 24px rgba(108,99,255,0.4), var(--glow-cyan);
}

.btn-cart:active { transform: scale(0.97); }

/* Added state */
.btn-cart.added {
  background: linear-gradient(135deg, var(--green-neon) 0%, #059669 100%);
  box-shadow: 0 4px 14px rgba(52, 211, 153, 0.3), var(--glow-green);
}

/* Icon swap transition */
.icon-swap-enter-active,
.icon-swap-leave-active { transition: opacity 0.15s, transform 0.15s; }
.icon-swap-enter-from   { opacity: 0; transform: scale(0.6) rotate(-20deg); }
.icon-swap-leave-to     { opacity: 0; transform: scale(0.6) rotate(20deg); }

/* Menu pop transition */
.menu-pop-enter-active  { transition: opacity 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); }
.menu-pop-leave-active  { transition: opacity 0.1s; }
.menu-pop-enter-from    { opacity: 0; transform: scale(0.85) translateY(-6px); }
.menu-pop-leave-to      { opacity: 0; }

/* Mini spinner */
.mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(248,113,113,0.3);
  border-top-color: var(--red-neon);
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
