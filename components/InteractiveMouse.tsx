'use client'

import { useEffect } from 'react'
import { startRendering } from './interactiveCanvas'

export default function InteractiveMouse() {
  useEffect(() => {
    const cleanup = startRendering()
    return cleanup
  }, [])
  return (
    <canvas className="bg-skin-base pointer-events-none fixed inset-0 -z-10" id="canvas"></canvas>
  )
}
