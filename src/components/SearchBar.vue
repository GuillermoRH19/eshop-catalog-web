<template>
  <div class="search-bar">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        id="search-input"
        v-model="query"
        type="text"
        placeholder="Buscar producto por nombre..."
        class="search-input"
        @input="onInput"
      />
      <button v-if="query" class="clear-btn" @click="clear">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'search', value: string): void
}>()

const query = ref('')

function onInput() {
  emit('search', query.value)
}

function clear() {
  query.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-wrapper:focus-within {
  border-color: #6c63ff;
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
}

.search-icon {
  font-size: 1rem;
  margin-right: 0.6rem;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgba(226, 232, 240, 0.4);
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(226, 232, 240, 0.5);
  font-size: 0.9rem;
  padding: 0 0.2rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #e2e8f0;
}
</style>
