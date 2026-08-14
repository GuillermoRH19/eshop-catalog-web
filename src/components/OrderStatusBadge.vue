<template>
  <span class="status-badge" :class="`status-${status.toLowerCase()}`">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus } from '../api/orderApi'

const props = defineProps<{ status: OrderStatus }>()

const label = computed(() => {
  switch (props.status) {
    case 'Pending': return 'Pendiente'
    case 'Confirmed': return 'Confirmada'
    case 'Cancelled': return 'Cancelada'
    default: return props.status
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.status-pending {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--amber);
}
.status-confirmed {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: var(--green-neon);
}
.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--red-neon);
}
</style>
