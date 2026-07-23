<template>
  <div class="product-form">
    <h2 class="form-title">➕ Nuevo Producto</h2>
    <form @submit.prevent="onSubmit" class="form-grid">
      <div class="form-group">
        <label for="pf-name">Nombre <span class="required">*</span></label>
        <input id="pf-name" v-model="form.name" type="text" required placeholder="Ej: Laptop HP 15" />
      </div>

      <div class="form-group">
        <label for="pf-price">Precio (USD) <span class="required">*</span></label>
        <input id="pf-price" v-model.number="form.price" type="number" min="0" step="0.01" required placeholder="Ej: 999.99" />
      </div>

      <div class="form-group full-width">
        <label for="pf-description">Descripción</label>
        <textarea id="pf-description" v-model="form.description" rows="3" placeholder="Descripción del producto..."></textarea>
      </div>

      <div class="form-group">
        <label for="pf-category">Categorías</label>
        <input
          id="pf-category"
          v-model="categoryInput"
          type="text"
          placeholder="Ej: Electrónica, Laptops (separadas por coma)"
        />
        <p class="hint">Separa múltiples categorías con coma.</p>
      </div>

      <div class="form-group">
        <label for="pf-image">URL de Imagen</label>
        <input id="pf-image" v-model="form.imageFiles" type="url" placeholder="https://ejemplo.com/imagen.jpg" />
      </div>

      <!-- Vista previa de imagen -->
      <div v-if="form.imageFiles" class="form-group full-width preview-group">
        <label>Vista previa</label>
        <img :src="form.imageFiles" alt="Vista previa" class="image-preview" @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
      </div>

      <div class="form-actions full-width">
        <button type="button" class="btn btn-secondary" @click="reset">Limpiar</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting" class="btn-spinner"></span>
          {{ submitting ? 'Guardando...' : '✔ Guardar Producto' }}
        </button>
      </div>

      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createProduct } from '../api/productApi'

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

    successMsg.value = '¡Producto creado exitosamente! ✅'
    reset()
    emit('created')
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.detail || 'Error al crear el producto. Intenta de nuevo.'
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
.product-form {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #c4b5fd;
  margin: 0 0 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.7);
  letter-spacing: 0.02em;
}

.required {
  color: #f87171;
}

input, textarea {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
}

input:focus, textarea:focus {
  border-color: #6c63ff;
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
}

input::placeholder, textarea::placeholder {
  color: rgba(226, 232, 240, 0.3);
}

.hint {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.4);
  margin: 0;
}

.preview-group .image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, #6c63ff, #8b5cf6);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.13);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-msg {
  grid-column: 1 / -1;
  color: #34d399;
  font-size: 0.88rem;
  text-align: right;
  margin: 0;
}

.error-msg {
  grid-column: 1 / -1;
  color: #f87171;
  font-size: 0.88rem;
  text-align: right;
  margin: 0;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
