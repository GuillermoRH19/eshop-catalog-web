<template>
  <div v-if="status === 'Pending'" class="status-actions">
    <p v-if="error" class="status-error">{{ error }}</p>
    <div class="status-actions-row">
      <button class="btn-confirm" :disabled="!!updating" @click="update('Confirmed')">
        {{ updating === 'Confirmed' ? 'Confirmando…' : 'Confirmar Compra' }}
      </button>
      <button class="btn-cancel" :disabled="!!updating" @click="update('Cancelled')">
        {{ updating === 'Cancelled' ? 'Cancelando…' : 'Cancelar Pedido' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { updateOrderStatus, type OrderStatus } from '../api/orderApi'

const props = defineProps<{ orderId: string; status: OrderStatus }>()
const emit = defineEmits<{
  (e: 'update:status', status: 'Confirmed' | 'Cancelled'): void
}>()

const updating = ref<'Confirmed' | 'Cancelled' | null>(null)
const error = ref('')

// Pending -> Confirmed y Pending -> Cancelled son las únicas transiciones que el backend acepta;
// por eso este componente ni se muestra si status ya no es Pending (ver v-if arriba) — así una
// orden Cancelled nunca puede volver a Confirmed desde acá.
async function update(newStatus: 'Confirmed' | 'Cancelled') {
  updating.value = newStatus
  error.value = ''
  try {
    await updateOrderStatus(props.orderId, newStatus)
    emit('update:status', newStatus)
  } catch (e: any) {
    console.error('[OrderStatusActions] No se pudo actualizar el estado de la orden:', e)
    error.value = e.response?.data?.detail ?? 'No se pudo actualizar el estado. Intenta de nuevo.'
  } finally {
    updating.value = null
  }
}
</script>

<style scoped>
.status-actions { width: 100%; }

.status-error {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  color: var(--red-neon);
  text-align: center;
}

.status-actions-row {
  display: flex;
  gap: 0.6rem;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.btn-confirm {
  border: none;
  background: linear-gradient(135deg, var(--green-neon), #10b981);
  color: #fff;
}
.btn-confirm:hover:not(:disabled) { opacity: 0.9; }

.btn-cancel {
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: var(--red-neon);
}
.btn-cancel:hover:not(:disabled) { background: rgba(239, 68, 68, 0.18); }

.btn-confirm:disabled,
.btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; }
</style>
