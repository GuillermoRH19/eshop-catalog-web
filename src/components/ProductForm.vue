<template>
  <div class="product-form">
    <!-- Section header -->
    <div class="form-header">
      <div class="form-header-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <div>
        <h2 class="form-title">Nuevo Producto</h2>
        <p class="form-subtitle">Completa los datos para agregar al catálogo</p>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="form-grid">
      <!-- Nombre -->
      <div class="form-group">
        <label for="pf-name">
          Nombre
          <span class="required">*</span>
        </label>
        <div class="input-wrap" :class="{ 'input-active': form.name }">
          <input
            id="pf-name"
            v-model="form.name"
            type="text"
            required
            placeholder="Ej: Laptop HP 15"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Precio -->
      <div class="form-group">
        <label for="pf-price">
          Precio (USD)
          <span class="required">*</span>
        </label>
        <div class="input-wrap" :class="{ 'input-active': form.price > 0 }">
          <input
            id="pf-price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Ej: 999.99"
          />
        </div>
      </div>

      <!-- Descripción -->
      <div class="form-group full-width">
        <label for="pf-description">Descripción</label>
        <div class="input-wrap" :class="{ 'input-active': form.description }">
          <textarea
            id="pf-description"
            v-model="form.description"
            rows="3"
            placeholder="Descripción del producto..."
          />
        </div>
      </div>

      <!-- Categorías -->
      <div class="form-group">
        <label for="pf-category">Categorías</label>
        <div class="input-wrap" :class="{ 'input-active': categoryInput }">
          <input
            id="pf-category"
            v-model="categoryInput"
            type="text"
            placeholder="Ej: Electrónica, Laptops"
          />
        </div>
        <p class="hint">Separa múltiples categorías con coma.</p>
      </div>

      <!-- URL Imagen -->
      <div class="form-group">
        <label for="pf-image">URL de Imagen</label>
        <div class="input-wrap" :class="{ 'input-active': form.imageFiles }">
          <input
            id="pf-image"
            v-model="form.imageFiles"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      <!-- Vista previa -->
      <div v-if="form.imageFiles" class="form-group full-width preview-group">
        <label>Vista previa</label>
        <div class="preview-wrap">
          <img
            :src="form.imageFiles"
            alt="Vista previa"
            class="image-preview"
            @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions full-width">
        <button type="button" class="btn btn-secondary" @click="reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Limpiar
        </button>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <OrbLoader v-if="submitting" size="sm" color="purple" />
          <template v-else>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Guardar Producto
          </template>
        </button>
      </div>

      <!-- Messages -->
      <Transition name="msg-slide">
        <div v-if="successMsg" class="msg-badge msg-success full-width">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {{ successMsg }}
        </div>
      </Transition>

      <Transition name="msg-slide">
        <div v-if="errorMsg" class="msg-badge msg-error full-width">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ errorMsg }}
        </div>
      </Transition>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createProduct } from '../api/productApi'
import OrbLoader from './OrbLoader.vue'

const emit = defineEmits<{
  (e: 'created'): void
}>()

const form = reactive({
  name: '',
  description: '',
  imageFiles: '',
  price: 0
})

const categoryInput = ref('')
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

async function onSubmit() {
  submitting.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const categories = categoryInput.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0)

    await createProduct({
      name: form.name,
      description: form.description,
      imageFiles: form.imageFiles,
      price: form.price,
      category: categories
    })

    successMsg.value = '¡Producto creado exitosamente!'
    reset()
    emit('created')
    setTimeout(() => { successMsg.value = '' }, 4000)
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.detail || 'Error al crear el producto. Intenta de nuevo.'
    setTimeout(() => { errorMsg.value = '' }, 5000)
  } finally {
    submitting.value = false
  }
}

function reset() {
  form.name = ''
  form.description = ''
  form.imageFiles = ''
  form.price = 0
  categoryInput.value = ''
}
</script>

<style scoped>
/* ── Form Card ── */
.product-form {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.product-form:hover {
  border-color: var(--glass-border-hover);
  box-shadow: 0 0 40px rgba(108, 99, 255, 0.06);
}

/* ── Header ── */
.form-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1.75rem;
}

.form-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--purple), var(--violet));
  box-shadow: var(--glow-purple);
  color: #fff;
  flex-shrink: 0;
  margin-top: 2px;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--purple), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
  margin: 0 0 2px;
}

.form-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Grid ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.full-width {
  grid-column: 1 / -1;
}

/* ── Labels ── */
label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.required {
  color: var(--red-neon);
  margin-left: 2px;
}

/* ── Input Wrap ── */
.input-wrap {
  position: relative;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--bg-surface);
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}

.input-wrap:focus-within {
  border-color: rgba(108, 99, 255, 0.55);
  background: rgba(108, 99, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.12), inset 0 0 0 1px rgba(108, 99, 255, 0.2);
}

.input-wrap.input-active {
  border-color: rgba(108, 99, 255, 0.25);
}

/* ── Inputs / Textarea ── */
input,
textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.65rem 0.9rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  display: block;
}

input::placeholder,
textarea::placeholder {
  color: var(--text-faint);
}

/* Prevent number input arrows (cleaner look) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.4;
}

/* ── Hint ── */
.hint {
  font-size: 0.72rem;
  color: var(--text-faint);
}

/* ── Image Preview ── */
.preview-wrap {
  display: inline-block;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.image-preview {
  width: 96px;
  height: 96px;
  object-fit: cover;
  display: block;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.65rem 1.4rem;
  font-size: 0.88rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.12s, box-shadow 0.25s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.96);
}

/* Primary — purple gradient + neon glow */
.btn-primary {
  background: linear-gradient(135deg, var(--purple) 0%, var(--violet) 100%);
  color: #fff;
  min-width: 155px;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--glow-purple), 0 4px 15px rgba(108, 99, 255, 0.4);
  opacity: 0.92;
}

/* Secondary — ghost */
.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-muted);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--glass-border-hover);
}

/* ── Message badges ── */
.msg-badge {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 500;
}

.msg-success {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: var(--green-neon);
}

.msg-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--red-neon);
}

/* ── Transitions ── */
.msg-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-slide-leave-active {
  transition: all 0.2s ease;
}
.msg-slide-enter-from,
.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .product-form {
    padding: 1.5rem;
  }
}
</style>
