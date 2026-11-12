import { useEffect, useRef } from 'react'

const COLORS = ['#ff5d8f', '#ff8a5c', '#ffc83d', '#2ec4b6', '#3d9bff', '#7c6cf6']

type Star = {
  x: number
  y: number
  r: number
  color: string
  phase: number
  speed: number
  vx: number
}

export default function StarField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let raf = 0
    let stars: Star[] = []

    const paintStars = () => {
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        ctx.globalAlpha = 0.7
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(90, Math.floor((width * height) / 16000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.2 + Math.random() * 2.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
        vx: -0.12 - Math.random() * 0.2,
      }))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((time / 1000) * star.speed + star.phase))
        ctx.globalAlpha = twinkle * 0.8
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
        star.x += star.vx
        if (star.x < -4) star.x = width + 4
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      paintStars()
    } else {
      raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
