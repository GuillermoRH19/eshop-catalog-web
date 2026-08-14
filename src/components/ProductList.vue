<template>
  <div class="product-list">

    <!-- ── Loading ── -->
    <div v-if="loading" class="state-box">
      <OrbLoader size="lg" color="purple" label="Cargando productos..." />
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="products.length === 0" class="state-box">
      <OrbLoader size="md" color="cyan" label="No se encontraron productos." />
    </div>

    <!-- ── Grid ── -->
    <template v-else>
      <div class="cards-grid">
        <ProductCard
          v-for="(product, index) in products"
          :key="product.id"
          :product="product"
          :delay="`${index * 55}ms`"
          @add-to-cart="(p) => emit('add-to-cart', p)"
          @delete="(id) => emit('delete', id)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../api/productApi'
import OrbLoader from './OrbLoader.vue'
import ProductCard from './ProductCard.vue'

defineProps<{
  products: Product[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'add-to-cart', product: Product): void
}>()
</script>

<style scoped>
.product-list { width: 100%; }

/* State boxes */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
}

/* Responsive grid */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 560px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 900px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1200px) {
  .cards-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
