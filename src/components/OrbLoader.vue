<template>
  <div
    class="orb-wrapper"
    :class="[`orb--${size}`, `orb--${color}`]"
    role="status"
    :aria-label="label"
  >
    <div class="orb-aura" />
    <div class="orb-sphere">
      <div class="orb-glare" />
      <div class="orb-inner" />
    </div>
    <p v-if="label" class="orb-label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'cyan' | 'amber'
  label?: string
}>(), {
  size: 'md',
  color: 'purple',
  label: ''
})
</script>

<style scoped>
/* ── Size tokens ── */
.orb--sm  { --orb-size: 48px;  --aura-size: 80px;  }
.orb--md  { --orb-size: 80px;  --aura-size: 130px; }
.orb--lg  { --orb-size: 120px; --aura-size: 200px; }

/* ── Color tokens ── */
.orb--purple {
  --c1: #22c55e;
  --c2: #4ade80;
  --c3: rgba(34, 197, 94,0.35);
  --c-glow: rgba(34, 197, 94,0.5);
  --c-shine: rgba(187,247,208,0.6);
}
.orb--cyan {
  --c1: #2dd4bf;
  --c2: #0891b2;
  --c3: rgba(45, 212, 191,0.35);
  --c-glow: rgba(45, 212, 191,0.5);
  --c-shine: rgba(103,232,249,0.6);
}
.orb--amber {
  --c1: #f59e0b;
  --c2: #d97706;
  --c3: rgba(245,158,11,0.35);
  --c-glow: rgba(245,158,11,0.5);
  --c-shine: rgba(253,230,138,0.6);
}

/* ── Wrapper ── */
.orb-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* ── Pulsing aura ring ── */
.orb-aura {
  position: absolute;
  width: var(--aura-size);
  height: var(--aura-size);
  border-radius: 50%;
  background: radial-gradient(circle, var(--c3) 0%, transparent 70%);
  animation: orb-breathe 2.6s ease-in-out infinite;
}

/* ── Main sphere ── */
.orb-sphere {
  position: relative;
  width: var(--orb-size);
  height: var(--orb-size);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, var(--c-shine) 0%, transparent 45%),
    radial-gradient(circle at 68% 75%, rgba(0,0,0,0.6) 0%, transparent 50%),
    radial-gradient(circle at center, var(--c1) 0%, var(--c2) 60%, var(--bg-deep) 100%);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.07),
    inset 0 2px 8px rgba(255,255,255,0.12),
    0 0 30px var(--c-glow),
    0 0 60px var(--c3);
  animation: orb-float 3s ease-in-out infinite, orb-glow-pulse 2.6s ease-in-out infinite;
}

/* ── Top glare ── */
.orb-glare {
  position: absolute;
  top: 12%;
  left: 18%;
  width: 38%;
  height: 22%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, transparent 100%);
  transform: rotate(-20deg);
  filter: blur(2px);
}

/* ── Inner warm core ── */
.orb-inner {
  position: absolute;
  bottom: 18%;
  right: 18%;
  width: 28%;
  height: 28%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 80%);
  filter: blur(3px);
}

/* ── Label ── */
.orb-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(226,232,240,0.55);
  letter-spacing: 0.04em;
  text-align: center;
  animation: orb-fade-label 2.6s ease-in-out infinite;
}

/* ── Keyframes ── */
@keyframes orb-breathe {
  0%, 100% { transform: scale(1);   opacity: 0.7; }
  50%       { transform: scale(1.2); opacity: 1;   }
}

@keyframes orb-float {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-6px); }
}

@keyframes orb-glow-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.07),
      inset 0 2px 8px rgba(255,255,255,0.12),
      0 0 30px var(--c-glow),
      0 0 60px var(--c3);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.1),
      inset 0 2px 8px rgba(255,255,255,0.18),
      0 0 50px var(--c-glow),
      0 0 100px var(--c3);
  }
}

@keyframes orb-fade-label {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.9;  }
}
</style>
