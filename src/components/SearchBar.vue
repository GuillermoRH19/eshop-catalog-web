<template>
  <div class="search-bar">
    <div class="search-wrapper" :class="{ focused: isFocused }">
      <!-- Search icon SVG -->
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        id="search-input"
        v-model="query"
        type="text"
        placeholder="Buscar producto por nombre..."
        class="search-input"
        autocomplete="off"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <Transition name="fade-btn">
        <button v-if="query" class="clear-btn" @click="clear" aria-label="Limpiar búsqueda">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'search', value: string): void
}>()

const query = ref('')
const isFocused = ref(false)

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
  margin-bottom: 1.75rem;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.1rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.search-wrapper.focused {
  border-color: rgba(108, 99, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.12), var(--glow-purple);
  background: rgba(15, 15, 28, 0.85);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.25s;
}

.search-wrapper.focused .search-icon {
  color: var(--purple);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-faint);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--red-neon);
}

/* Transition for clear button */
.fade-btn-enter-active,
.fade-btn-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
