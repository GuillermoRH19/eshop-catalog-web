<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">
        <Transition name="drawer-slide">
          <aside v-if="open" class="drawer" role="dialog" aria-modal="true" aria-label="Órdenes">

            <!-- Header -->
            <div class="drawer-header">
              <div class="drawer-title-group">
                <div class="drawer-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                </div>
                <div>
                  <h2 class="drawer-title">{{ basketStore.isAdmin ? 'Todas las Órdenes' : 'Mis Órdenes' }}</h2>
                  <p class="drawer-subtitle">
                    {{ basketStore.isAdmin ? 'Vista admin — todos los clientes' : basketStore.userName }}
                  </p>
                </div>
              </div>
              <button class="close-btn" @click="close" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="drawer-body">
              <div v-if="loading" class="orders-state">
                <OrbLoader size="md" color="purple" label="Cargando órdenes..." />
              </div>

              <div v-else-if="loadError" class="orders-state">
                <OrbLoader size="md" color="amber" label="No se pudieron cargar las órdenes." />
                <button class="btn-retry" @click="loadOrders">Reintentar</button>
              </div>

              <div v-else-if="orders.length === 0" class="orders-state">
                <OrbLoader size="md" color="cyan" label="Todavía no hay órdenes." />
              </div>

              <ul v-else class="order-list">
                <li v-for="order in orders" :key="order.id" class="order-card">
                  <div class="order-card-header">
                    <div>
                      <p class="order-id">#{{ order.id.slice(0, 8) }}</p>
                      <p class="order-date">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <OrderStatusBadge :status="order.status" />
                  </div>

                  <p v-if="basketStore.isAdmin" class="order-customer">Cliente: <strong>{{ order.customerId }}</strong></p>

                  <ul class="order-items">
                    <li v-for="item in order.items" :key="item.productId">
                      {{ item.quantity }}× {{ item.productName }}
                    </li>
                  </ul>

                  <div class="order-card-footer">
                    <strong class="order-total">${{ order.total.toFixed(2) }}</strong>
                    <a class="btn-pdf-sm" :href="getOrderPdfUrl(order.id)" target="_blank" rel="noopener">
                      PDF
                    </a>
                  </div>

                  <OrderStatusActions
                    class="order-status-actions"
                    :order-id="order.id"
                    :status="order.status"
                    @update:status="s => order.status = s"
                  />
                </li>
              </ul>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import OrbLoader from './OrbLoader.vue'
import OrderStatusBadge from './OrderStatusBadge.vue'
import OrderStatusActions from './OrderStatusActions.vue'
import { useBasketStore } from '../store/basketStore'
import { getOrdersByCustomer, getAllOrders, getOrderPdfUrl, type Order } from '../api/orderApi'

const basketStore = useBasketStore()

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const orders    = ref<Order[]>([])
const loading   = ref(false)
const loadError = ref(false)

function close() {
  emit('update:open', false)
}

async function loadOrders() {
  loading.value = true
  loadError.value = false
  try {
    const response = basketStore.isAdmin
      ? await getAllOrders()
      : await getOrdersByCustomer(basketStore.userName)
    orders.value = response.data.orders
  } catch (e) {
    console.error('[OrdersView] No se pudieron cargar las órdenes:', e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) loadOrders()
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--modal-backdrop);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6), -1px 0 0 rgba(108, 99, 255, 0.12);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.drawer-title-group { display: flex; align-items: center; gap: 0.85rem; }

.drawer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--purple), var(--violet));
  box-shadow: var(--glow-purple);
  color: #fff;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--purple), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px;
}

.drawer-subtitle { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--red-neon);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.drawer-body::-webkit-scrollbar { width: 5px; }
.drawer-body::-webkit-scrollbar-track { background: transparent; }
.drawer-body::-webkit-scrollbar-thumb { background: rgba(108, 99, 255, 0.25); border-radius: 999px; }

.orders-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3.5rem 1.5rem;
}

.btn-retry {
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-retry:hover {
  background: rgba(108, 99, 255, 0.12);
  border-color: rgba(108, 99, 255, 0.3);
}

.order-list {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.order-card {
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
}

.order-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.order-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.order-date {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.order-customer {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}
.order-customer strong { color: var(--text-primary); }

.order-items {
  list-style: none;
  padding: 0;
  margin: 0 0 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.order-items li {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid var(--glass-border);
}

.order-total { font-size: 0.95rem; color: var(--text-primary); font-weight: 800; }

.order-status-actions { margin-top: 0.65rem; }

.btn-pdf-sm {
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(108, 99, 255, 0.35);
  background: rgba(108, 99, 255, 0.1);
  color: var(--purple);
  font-size: 0.74rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.btn-pdf-sm:hover {
  background: rgba(108, 99, 255, 0.18);
  border-color: rgba(108, 99, 255, 0.5);
}

/* Transitions */
.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }

.drawer-slide-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from   { transform: translateX(100%); }
.drawer-slide-leave-to     { transform: translateX(100%); }

@media (max-width: 480px) {
  .drawer { max-width: 100%; }
}
</style>
