<template>
  <div class="bg-mesh" aria-hidden="true">
    <canvas ref="canvasRef" class="bg-canvas" />
    <div class="bg-noise" />
    <div class="bg-vignette" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ theme?: string }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrameId = 0
let time = 0

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  darkColor: string
  lightColor: string
}

const ORBS: Orb[] = [
  { x: 0.15, y: 0.2,  vx: 0.00018, vy: 0.00012,  r: 0.38, darkColor: 'rgba(108,99,255,0.28)',  lightColor: 'rgba(108,99,255,0.12)' },
  { x: 0.80, y: 0.75, vx: -0.00014, vy: 0.00010, r: 0.42, darkColor: 'rgba(139,92,246,0.22)',  lightColor: 'rgba(139,92,246,0.10)' },
  { x: 0.5,  y: 0.5,  vx: 0.00010, vy: -0.00016, r: 0.30, darkColor: 'rgba(6,182,212,0.18)',   lightColor: 'rgba(6,182,212,0.09)'  },
  { x: 0.85, y: 0.15, vx: -0.00012, vy: 0.00020, r: 0.28, darkColor: 'rgba(217,70,239,0.16)',  lightColor: 'rgba(217,70,239,0.08)' },
  { x: 0.1,  y: 0.85, vx: 0.00020, vy: -0.00010, r: 0.25, darkColor: 'rgba(79,70,229,0.20)',   lightColor: 'rgba(79,70,229,0.10)'  },
  { x: 0.6,  y: 0.1,  vx: -0.00008, vy: 0.00018, r: 0.32, darkColor: 'rgba(6,182,212,0.14)',   lightColor: 'rgba(6,182,212,0.07)'  },
]

function isDark() {
  return (props.theme ?? 'dark') !== 'light'
}

function draw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // Background adapts to theme
  ctx.fillStyle = isDark() ? '#0a0a0f' : '#f1f5fb'
  ctx.fillRect(0, 0, w, h)

  time += 0.5

  for (const orb of ORBS) {
    const px = (orb.x + Math.sin(time * orb.vx * 1000) * 0.18) * w
    const py = (orb.y + Math.cos(time * orb.vy * 1000) * 0.18) * h
    const radius = orb.r * Math.min(w, h)
    const color = isDark() ? orb.darkColor : orb.lightColor

    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.arc(px, py, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  }
}

function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function loop(canvas: HTMLCanvasElement) {
  draw(canvas)
  animFrameId = requestAnimationFrame(() => loop(canvas))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  resize(canvas)
  loop(canvas)

  window.addEventListener('resize', () => {
    if (canvasRef.value) resize(canvasRef.value)
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
})
</script>

<style scoped>
.bg-mesh {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Fine noise texture via SVG data URI */
.bg-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  opacity: 0.45;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Soft vignette at corners */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
}
</style>
