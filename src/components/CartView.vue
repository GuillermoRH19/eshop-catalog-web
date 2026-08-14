<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">

        <Transition name="drawer-slide">
          <aside v-if="open" class="drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras">

            <!-- Header -->
            <div class="drawer-header">
              <div class="drawer-title-group">
                <div class="drawer-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <div>
                  <h2 class="drawer-title">Mi Carrito</h2>
                  <p class="drawer-subtitle">
                    {{ basketStore.itemsCount }} producto{{ basketStore.itemsCount !== 1 ? 's' : '' }}
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
              <!-- Confirmación de compra -->
              <div v-if="orderConfirmation" class="order-confirmation">
                <div class="confirmation-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <h3 class="confirmation-title">¡Compra realizada!</h3>
                <p class="confirmation-subtitle">Tu orden se generó correctamente.</p>

                <dl class="confirmation-details">
                  <div class="confirmation-row">
                    <dt>Orden</dt>
                    <dd class="confirmation-order-id">{{ orderConfirmation.id }}</dd>
                  </div>
                  <div class="confirmation-row">
                    <dt>Fecha</dt>
                    <dd>{{ formatDate(orderConfirmation.createdAt) }}</dd>
                  </div>
                  <div class="confirmation-row">
                    <dt>Estado</dt>
                    <dd>{{ statusLabel(orderConfirmation.status) }}</dd>
                  </div>
                  <div class="confirmation-row">
                    <dt>Total</dt>
                    <dd class="confirmation-total">${{ orderConfirmation.total.toFixed(2) }}</dd>
                  </div>
                </dl>

                <div class="confirmation-actions">
                  <a
                    class="btn-pdf"
                    :href="getOrderPdfUrl(orderConfirmation.id)"
                    target="_blank"
                    rel="noopener"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar PDF
                  </a>
                  <button class="btn-continue" @click="close">Seguir comprando</button>
                </div>
              </div>

              <div v-else-if="basketStore.loading && basketStore.cartItems.length === 0" class="cart-state">
                <OrbLoader size="md" color="purple" label="Cargando carrito..." />
              </div>

              <div v-else-if="basketStore.cartItems.length === 0" class="cart-state">
                <OrbLoader size="md" color="cyan" label="Tu carrito está vacío." />
                <button class="btn-continue" @click="close">Seguir comprando</button>
              </div>

              <ul v-else class="cart-list">
                <li v-for="item in basketStore.cartItems" :key="item.productId" class="cart-item">
                  <div class="cart-item-img">
                    <img
                      v-if="item.imageFiles"
                      :src="item.imageFiles"
                      :alt="item.productName"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <span v-else>📦</span>
                  </div>
                  <div class="cart-item-info">
                    <p class="cart-item-name">{{ item.productName }}</p>
                    <p class="cart-item-meta">
                      Cantidad: <strong>{{ item.quantity }}</strong> · ${{ item.price.toFixed(2) }} c/u
                    </p>
                    <p class="cart-item-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</p>
                  </div>
                  <button
                    class="cart-item-remove"
                    @click="basketStore.removeFromCart(item.productId)"
                    aria-label="Quitar producto"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>

            <!-- Footer -->
            <div v-if="!orderConfirmation && basketStore.cartItems.length > 0" class="drawer-footer">
              <p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>
              <div class="cart-total-row">
                <span>Total</span>
                <strong>${{ basketStore.cartTotal.toFixed(2) }}</strong>
              </div>
              <div class="footer-actions">
                <button class="btn-empty" :disabled="checkingOut" @click="basketStore.emptyCart()">Vaciar carrito</button>
                <button class="btn-checkout" :disabled="checkingOut" @click="handleCheckout">
                  {{ checkingOut ? 'Procesando…' : 'Proceder al pago →' }}
                </button>
              </div>
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
import { useBasketStore } from '../store/basketStore'
import { createOrder, getOrderPdfUrl, type Order } from '../api/orderApi'

const basketStore = useBasketStore()

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const checkingOut = ref(false)
const checkoutError = ref('')
const orderConfirmation = ref<Order | null>(null)

function close() {
  emit('update:open', false)
  // Al cerrar el drawer después de una compra, se resetea para que la próxima vez que se
  // abra (carrito ya vacío) se vea el estado normal en vez de la confirmación anterior.
  orderConfirmation.value = null
  checkoutError.value = ''
}

async function handleCheckout() {
  checkingOut.value = true
  checkoutError.value = ''
  try {
    // Idempotency-Key único por intento: si el request se reintenta con la misma key,
    // Orders.API devuelve la orden ya creada en vez de duplicarla.
    const idempotencyKey = crypto.randomUUID()
    const response = await createOrder(basketStore.cart.userName, idempotencyKey)
    orderConfirmation.value = response.data
    await basketStore.emptyCart()
  } catch (e: any) {
    console.error('[CartView] Error al generar la orden:', e)
    checkoutError.value =
      e.response?.data?.detail ?? 'No se pudo generar la orden. Intenta de nuevo en unos segundos.'
  } finally {
    checkingOut.value = false
  }
}

function statusLabel(status: Order['status']): string {
  switch (status) {
    case 'Pending': return 'Pendiente'
    case 'Confirmed': return 'Confirmada'
    case 'Cancelled': return 'Cancelada'
    default: return status
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: rgba(12, 12, 22, 0.96);
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

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

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
  background: linear-gradient(90deg, #c4b5fd, var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px;
}

.drawer-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  padding: 0.5rem 0;
}

.drawer-body::-webkit-scrollbar { width: 5px; }
.drawer-body::-webkit-scrollbar-track { background: transparent; }
.drawer-body::-webkit-scrollbar-thumb { background: rgba(108, 99, 255, 0.25); border-radius: 999px; }

.cart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3.5rem 1.5rem;
}

.btn-continue {
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-continue:hover {
  background: rgba(108, 99, 255, 0.12);
  border-color: rgba(108, 99, 255, 0.3);
}

/* ── Order confirmation ── */
.order-confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  padding: 2.5rem 1.75rem;
}

.confirmation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: var(--green-neon);
  margin-bottom: 0.5rem;
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);
}

.confirmation-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.confirmation-subtitle {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

.confirmation-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  margin: 0 0 1.75rem;
}

.confirmation-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.82rem;
}
.confirmation-row dt { color: var(--text-muted); }
.confirmation-row dd { margin: 0; color: var(--text-primary); font-weight: 600; text-align: right; }

.confirmation-order-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  word-break: break-all;
}

.confirmation-total {
  font-size: 1.1rem;
  color: var(--green-neon);
  font-weight: 800;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  align-items: center;
}

.btn-pdf {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(108, 99, 255, 0.35);
  background: rgba(108, 99, 255, 0.1);
  color: var(--purple);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-pdf:hover {
  background: rgba(108, 99, 255, 0.18);
  border-color: rgba(108, 99, 255, 0.5);
}

.checkout-error {
  margin: 0 0 0.85rem;
  font-size: 0.78rem;
  color: var(--red-neon);
  text-align: center;
}

.cart-list {
  list-style: none;
  padding: 0.5rem 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  transition: background 0.15s;
}
.cart-item:hover { background: rgba(255, 255, 255, 0.05); }

.cart-item-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(108, 99, 255, 0.12);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.cart-item-img img { width: 100%; height: 100%; object-fit: cover; }

.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item-meta {
  font-size: 0.74rem;
  color: var(--text-muted);
  margin: 0 0 2px;
}
.cart-item-subtotal {
  font-size: 0.82rem;
  color: var(--green-neon);
  font-weight: 700;
  margin: 0;
}

.cart-item-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: none;
  border: 1px solid transparent;
  color: var(--text-faint);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.cart-item-remove:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--red-neon);
}

.drawer-footer {
  flex-shrink: 0;
  padding: 1.15rem 1.75rem 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.cart-total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.92rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.cart-total-row strong { font-size: 1.3rem; color: var(--text-primary); font-weight: 800; }

.footer-actions {
  display: flex;
  gap: 0.6rem;
}

.btn-empty {
  padding: 0.7rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-neon);
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn-empty:hover { opacity: 0.85; }

.btn-checkout {
  flex: 1;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--purple), var(--cyan));
  color: #fff;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.25);
}
.btn-checkout:hover { opacity: 0.9; box-shadow: var(--glow-purple); }

.btn-empty:disabled,
.btn-checkout:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
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
