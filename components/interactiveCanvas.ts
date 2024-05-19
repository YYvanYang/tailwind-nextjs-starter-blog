interface OscillatorConfig {
  phase?: number
  offset?: number
  frequency?: number
  amplitude?: number
}

interface LineConfig {
  spring: number
}

interface AppConfig {
  debug: boolean
  friction: number
  trails: number
  size: number
  dampening: number
  tension: number
}

class Oscillator {
  phase: number
  offset: number
  frequency: number
  amplitude: number

  constructor({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 }: OscillatorConfig = {}) {
    this.phase = phase
    this.offset = offset
    this.frequency = frequency
    this.amplitude = amplitude
  }

  update(): number {
    this.phase += this.frequency
    return this.offset + Math.sin(this.phase) * this.amplitude
  }
}

class Node {
  x: number
  y: number
  vx: number
  vy: number

  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
  }
}

class Line {
  spring: number
  friction: number
  nodes: Node[]

  constructor({ spring }: LineConfig) {
    this.spring = spring + 0.1 * Math.random() - 0.05
    this.friction = app.config.friction + 0.01 * Math.random() - 0.005
    this.nodes = Array.from({ length: app.config.size }, () => new Node(app.pos.x, app.pos.y))
  }

  update(): void {
    let spring = this.spring
    let t = this.nodes[0]
    t.vx += (app.pos.x - t.x) * spring
    t.vy += (app.pos.y - t.y) * spring
    for (let i = 0; i < this.nodes.length; i++) {
      t = this.nodes[i]
      if (i > 0) {
        const n = this.nodes[i - 1]
        t.vx += (n.x - t.x) * spring
        t.vy += (n.y - t.y) * spring
        t.vx += n.vx * app.config.dampening
        t.vy += n.vy * app.config.dampening
      }
      t.vx *= this.friction
      t.vy *= this.friction
      t.x += t.vx
      t.y += t.vy
      spring *= app.config.tension
    }
  }

  draw(): void {
    const ctx = app.ctx!
    ctx.beginPath()
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y)
    for (let i = 1; i < this.nodes.length - 2; i++) {
      const e = this.nodes[i]
      const t = this.nodes[i + 1]
      const x = 0.5 * (e.x + t.x)
      const y = 0.5 * (e.y + t.y)
      ctx.quadraticCurveTo(e.x, e.y, x, y)
    }
    const e = this.nodes[this.nodes.length - 2]
    const t = this.nodes[this.nodes.length - 1]
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y)
    ctx.stroke()
    ctx.closePath()
  }
}

const app = {
  ctx: null as (CanvasRenderingContext2D & { running?: boolean; frame?: number }) | null,
  f: null as Oscillator | null,
  e: 0,
  pos: { x: 0, y: 0 },
  lines: [] as Line[],
  config: {
    debug: true,
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98,
  } as AppConfig,
}

function addEventListeners(): void {
  document.addEventListener('mousemove', handleEvent)
  document.addEventListener('touchstart', handleEvent)
  document.addEventListener('touchmove', handleEvent)
  window.addEventListener('resize', resizeCanvas)
  document.body.addEventListener('orientationchange', resizeCanvas)
  window.addEventListener('focus', () => {
    if (app.ctx && !app.ctx.running) {
      app.ctx.running = true
      render()
    }
  })
  window.addEventListener('blur', () => {
    if (app.ctx) {
      app.ctx.running = false
    }
  })
}

function handleEvent(e: MouseEvent | TouchEvent): void {
  if (e instanceof TouchEvent) {
    app.pos.x = e.touches[0].pageX
    app.pos.y = e.touches[0].pageY
  } else if (e instanceof MouseEvent) {
    app.pos.x = e.clientX
    app.pos.y = e.clientY
  }
  e.preventDefault()
  if (!app.lines.length) initializeLines()
}

function initializeLines(): void {
  app.lines = Array.from(
    { length: app.config.trails },
    (_, i) => new Line({ spring: 0.45 + (i / app.config.trails) * 0.025 })
  )
}

function render(): void {
  if (!app.ctx || !app.ctx.running) return
  app.ctx.globalCompositeOperation = 'source-over'
  app.ctx.clearRect(0, 0, app.ctx.canvas.width, app.ctx.canvas.height)
  app.ctx.globalCompositeOperation = 'lighter'
  app.ctx.strokeStyle = `hsla(${Math.round(app.f!.update())},90%,50%,0.25)`
  app.ctx.lineWidth = 1
  app.lines.forEach((line) => {
    line.update()
    line.draw()
  })
  app.ctx.frame!++
  requestAnimationFrame(render)
}

function resizeCanvas(): void {
  if (app.ctx) {
    app.ctx.canvas.width = window.innerWidth - 20
    app.ctx.canvas.height = window.innerHeight
  }
}

export function startRendering(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  app.ctx = canvas.getContext('2d')
  if (app.ctx) {
    app.ctx.running = true
    app.ctx.frame = 1
    app.f = new Oscillator({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    })
    addEventListeners()
    resizeCanvas()
    render()
  }
}
