<template>
  <div class="product-list">
    <!-- Estado vacío -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <div v-else-if="products.length === 0" class="state-box empty">
      <span class="empty-icon">📦</span>
      <p>No se encontraron productos.</p>
    </div>

    <!-- Tabla de productos -->
    <div v-else class="table-wrapper">
      <table class="product-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Categorías</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="product-row">
            <td>
              <img
                v-if="product.imageFiles"
                :src="product.imageFiles"
                :alt="product.name"
                class="product-img"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <span v-else class="no-img">🖼️</span>
            </td>
            <td class="name-cell">{{ product.name }}</td>
            <td class="desc-cell">{{ product.description }}</td>
            <td>
              <span
                v-for="cat in product.category"
                :key="cat"
                class="category-badge"
              >{{ cat }}</span>
            </td>
            <td class="price-cell">${{ product.price.toFixed(2) }}</td>
            <td>
              <button
                class="btn btn-danger"
                :disabled="deletingId === product.id"
                @click="handleDelete(product.id)"
              >
                {{ deletingId === product.id ? '...' : '🗑️ Eliminar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '../api/productApi'

defineProps<{
  products: Product[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const deletingId = ref<string | null>(null)

async function handleDelete(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return
  deletingId.value = id
  emit('delete', id)
  setTimeout(() => { deletingId.value = null }, 1500)
}
</script>

<style scoped>
.product-list {
  width: 100%;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(226, 232, 240, 0.5);
  gap: 0.75rem;
}

.empty-icon {
  font-size: 2.5rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(108, 99, 255, 0.2);
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.product-table thead tr {
  background: rgba(108, 99, 255, 0.15);
}

.product-table th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #a5b4fc;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.product-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s;
}

.product-row:last-child {
  border-bottom: none;
}

.product-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.product-table td {
  padding: 0.75rem 1rem;
  color: #e2e8f0;
  vertical-align: middle;
}

.product-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.no-img {
  font-size: 1.5rem;
  opacity: 0.4;
}

.name-cell {
  font-weight: 600;
  color: #c4b5fd;
}

.desc-cell {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.75;
}

.price-cell {
  font-weight: 700;
  color: #34d399;
  white-space: nowrap;
}

.category-badge {
  display: inline-block;
  background: rgba(108, 99, 255, 0.2);
  color: #a5b4fc;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  margin: 0.1rem;
  border: 1px solid rgba(108, 99, 255, 0.3);
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}
</style>
