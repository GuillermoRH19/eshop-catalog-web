<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">

        <!-- Slide-over panel -->
        <Transition name="drawer-slide">
          <aside v-if="open" class="drawer" role="dialog" aria-modal="true" aria-label="Agregar producto">

            <!-- Drawer header -->
            <div class="drawer-header">
              <div class="drawer-title-group">
                <div class="drawer-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h2 class="drawer-title">Nuevo Producto</h2>
                  <p class="drawer-subtitle">Completa los datos para agregar al catálogo</p>
                </div>
              </div>
              <button class="close-btn" @click="close" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Drawer body: renders ProductForm without its own card wrapper -->
            <div class="drawer-body">
              <ProductFormInner @created="onCreated" />
            </div>
          </aside>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import ProductFormInner from './ProductForm.vue'

const props = defineProps<{ open: boolean }>()
const emit  = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'created'): void
}>()

function close() {
  emit('update:open', false)
}

function onCreated() {
  emit('created')
  close()
}

// Lock body scroll when open
watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
/* ── Backdrop ── */
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

/* ── Drawer panel ── */
.drawer {
  width: 100%;
  max-width: 520px;
  height: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6), -1px 0 0 rgba(34, 197, 94, 0.12);
}

/* ── Header ── */
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
  background: linear-gradient(90deg, var(--purple), var(--cyan));
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

/* ── Body (scrollable) ── */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.75rem 2rem;
}

/* Override ProductForm's own card styling inside the drawer */
.drawer-body :deep(.product-form) {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  backdrop-filter: none;
}

.drawer-body :deep(.product-form):hover {
  box-shadow: none;
  border-color: transparent;
}

.drawer-body :deep(.form-header) {
  display: none; /* header is shown in drawer-header */
}

/* Scrollbar inside drawer */
.drawer-body::-webkit-scrollbar { width: 5px; }
.drawer-body::-webkit-scrollbar-track { background: transparent; }
.drawer-body::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.25); border-radius: 999px; }

/* ── Transitions ── */
/* Backdrop fade */
.modal-fade-enter-active { transition: opacity 0.25s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }

/* Drawer slide from right */
.drawer-slide-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from   { transform: translateX(100%); }
.drawer-slide-leave-to     { transform: translateX(100%); }

@media (max-width: 560px) {
  .drawer { max-width: 100%; }
  .drawer-body { padding: 1.25rem; }
}
</style>
