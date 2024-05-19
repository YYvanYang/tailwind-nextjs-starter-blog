'use client'

import { useEffect } from 'react'
import { startRendering } from './interactiveCanvas'

export default function MouseLine() {
  useEffect(() => {
    startRendering()
  }, [])
  return (
    <canvas className="bg-skin-base pointer-events-none fixed inset-0 -z-10" id="canvas"></canvas>
  )
}
