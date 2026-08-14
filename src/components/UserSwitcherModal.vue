<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">
        <Transition name="drawer-slide">
          <aside v-if="open" class="drawer" role="dialog" aria-modal="true" aria-label="Cambiar usuario">

            <!-- Header -->
            <div class="drawer-header">
              <div class="drawer-title-group">
                <div class="drawer-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h2 class="drawer-title">Cambiar usuario</h2>
                  <p class="drawer-subtitle">Activo: <strong>{{ basketStore.userName }}</strong></p>
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
              <form class="new-user-form" @submit.prevent="handleSwitch(draftName)">
                <label class="field-label" for="new-user-input">Nuevo usuario</label>
                <div class="new-user-row">
                  <input
                    id="new-user-input"
                    v-model="draftName"
                    class="user-input"
                    type="text"
                    placeholder="Escribe un nombre..."
                    maxlength="60"
                    :disabled="switching"
                  />
                  <button class="btn-use" type="submit" :disabled="switching || !draftName.trim()">
                    {{ switching && pendingName === draftName.trim() ? '...' : 'Usar' }}
                  </button>
                </div>
              </form>

              <p v-if="switchError" class="switch-error">{{ switchError }}</p>

              <div class="divider"><span>o elige uno existente</span></div>

              <div v-if="loadingList" class="list-state">
                <OrbLoader size="sm" color="purple" label="Cargando usuarios..." />
              </div>
              <p v-else-if="customers.length === 0" class="empty-text">
                Todavía no hay usuarios registrados. Escribe uno arriba.
              </p>
              <ul v-else class="customer-list">
                <li v-for="c in customers" :key="c.name">
                  <button
                    class="customer-item"
                    :class="{ active: c.name === basketStore.userName }"
                    :disabled="switching"
                    @click="handleSwitch(c.name)"
                  >
                    <span class="customer-avatar">{{ c.name.charAt(0).toUpperCase() }}</span>
                    <span class="customer-name">{{ c.name }}</span>
                    <span v-if="c.name === basketStore.userName" class="customer-current">Activo</span>
                    <OrbLoader v-else-if="switching && pendingName === c.name" size="sm" color="purple" />
                  </button>
                </li>
              </ul>
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
import { getCustomers, type CustomerListItem } from '../api/customerApi'

const basketStore = useBasketStore()

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const customers    = ref<CustomerListItem[]>([])
const loadingList  = ref(false)
const draftName    = ref('')
const switching    = ref(false)
const pendingName  = ref('')
const switchError  = ref('')

function close() {
  emit('update:open', false)
}

async function loadCustomers() {
  loadingList.value = true
  try {
    const res = await getCustomers()
    customers.value = res.data.customers
  } catch (e) {
    console.error('[UserSwitcherModal] No se pudo cargar la lista de usuarios:', e)
  } finally {
    loadingList.value = false
  }
}

async function handleSwitch(name: string) {
  const trimmed = name.trim()
  if (!trimmed || switching.value || trimmed === basketStore.userName) return

  switching.value = true
  pendingName.value = trimmed
  switchError.value = ''
  try {
    await basketStore.switchUser(trimmed)
    draftName.value = ''
    close()
  } catch (e: any) {
    console.error('[UserSwitcherModal] No se pudo cambiar de usuario:', e)
    switchError.value = 'No se pudo guardar el usuario. Intenta de nuevo.'
  } finally {
    switching.value = false
    pendingName.value = ''
  }
}

// Trae la lista fresca cada vez que se abre el modal.
watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) {
    switchError.value = ''
    loadCustomers()
  }
})
</script>

<style scoped>
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

.drawer {
  width: 100%;
  max-width: 400px;
  height: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
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

.drawer-title-group { display: flex; align-items: center; gap: 0.85rem; }

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

.drawer-subtitle { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.drawer-subtitle strong { color: var(--text-primary); }

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

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.75rem 2rem;
}
.drawer-body::-webkit-scrollbar { width: 5px; }
.drawer-body::-webkit-scrollbar-track { background: transparent; }
.drawer-body::-webkit-scrollbar-thumb { background: rgba(108, 99, 255, 0.25); border-radius: 999px; }

.field-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.new-user-row { display: flex; gap: 0.5rem; }

.user-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.86rem;
  outline: none;
  transition: border-color 0.2s;
}
.user-input:focus { border-color: rgba(108, 99, 255, 0.5); }
.user-input:disabled { opacity: 0.6; }

.btn-use {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--purple), var(--cyan));
  color: #fff;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn-use:hover:not(:disabled) { opacity: 0.9; }
.btn-use:disabled { opacity: 0.5; cursor: not-allowed; }

.switch-error {
  margin: 0.75rem 0 0;
  font-size: 0.78rem;
  color: var(--red-neon);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 1rem;
  color: var(--text-faint);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.list-state { display: flex; justify-content: center; padding: 1.5rem 0; }
.empty-text { font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 1rem 0; }

.customer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.customer-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.86rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}
.customer-item:hover:not(:disabled) {
  background: rgba(108, 99, 255, 0.1);
  border-color: rgba(108, 99, 255, 0.3);
}
.customer-item:disabled { cursor: not-allowed; opacity: 0.7; }

.customer-item.active {
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.3);
}

.customer-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--violet));
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  flex-shrink: 0;
}

.customer-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-current {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--green-neon);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
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
