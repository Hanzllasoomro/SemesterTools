'use client'
import React, { useRef, useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function PremiumQRGenerator() {
  const [text, setText] = useState('https://hanzllasoomro.vercel.app/')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [scale, setScale] = useState(1)
  const [logo, setLogo] = useState<string | null>(null)
  const [rounded, setRounded] = useState(true)
  const [transparentBg, setTransparentBg] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const baseSize = 350

  useEffect(() => { generate() }, [])

  async function generate() {
    const canvas = canvasRef.current
    if (!canvas) return
    const effectiveBg = transparentBg ? undefined : bgColor
    await QRCode.toCanvas(canvas, text, {
      width: baseSize,
      margin: 1,
      color: { dark: fgColor, light: effectiveBg || '#ffffff' },
    })

    const ctx = canvas.getContext('2d')!
    if (rounded) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const radius = 2
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4
          if (data[i] < 128 && ((x < radius || x > canvas.width - radius) || (y < radius || y > canvas.height - radius))) {
            data[i + 3] = 0
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    if (logo) {
      const img = new Image()
      img.src = logo
      await img.decode()
      const logoSize = baseSize * 0.2
      const radius = 12
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(baseSize / 2 - logoSize / 2, baseSize / 2 - logoSize / 2, logoSize, logoSize, radius)
      ctx.clip()
      ctx.drawImage(img, baseSize / 2 - logoSize / 2, baseSize / 2 - logoSize / 2, logoSize, logoSize)
      ctx.restore()
    }
  }

  function handleLogo(f: File | null) { if (!f) return setLogo(URL.createObjectURL(f)) }

  async function download(format: 'png' | 'svg') {
    const canvas = canvasRef.current
    if (!canvas) return
    if (format === 'png') {
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'qr.png'
      a.click()
    } else {
      const svg = await QRCode.toString(text, { type: 'svg', color: { dark: fgColor, light: bgColor } })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr.svg'
      a.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-6">
      <div className="grid md:grid-cols-2 gap-12 w-full max-w-6xl">

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">Premium QR Generator</h2>

          <div className="flex flex-col space-y-3">
            <label className="text-white/80 font-medium">Text / URL</label>
            <input 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Enter your URL" 
              className="bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-white/80 font-medium">Foreground</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-full h-12 rounded-xl border border-white/20 cursor-pointer" />
            </div>
            <div className="flex flex-col">
              <label className="text-white/80 font-medium">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-12 rounded-xl border border-white/20 cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="text-white/80 font-medium">Preview Scale ({(scale*100).toFixed(0)}%)</label>
            <input type="range" min={0.5} max={1} step={0.01} value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full mt-2 accent-cyan-500"/>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium">Rounded Modules</span>
              <input type="checkbox" checked={rounded} onChange={e => setRounded(e.target.checked)} className="w-6 h-6 accent-cyan-500 rounded"/>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium">Transparent Background</span>
              <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} className="w-6 h-6 accent-cyan-500 rounded"/>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-medium">Logo overlay (optional)</label>
            <input type="file" accept="image/*" onChange={e => handleLogo(e.target.files?.[0] || null)} className="text-white"/>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <button onClick={generate} className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">Generate</button>
            <button onClick={() => download('png')} className="px-6 py-3 border border-white/30 rounded-xl text-white hover:bg-white/10 transition">Download PNG</button>
            <button onClick={() => download('svg')} className="px-6 py-3 border border-white/30 rounded-xl text-white hover:bg-white/10 transition">Download SVG</button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative rounded-3xl p-6 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            style={{
              width: 'min(90vw, 380px)',
              height: 'min(90vw, 380px)',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease'
            }}
          >
            <canvas ref={canvasRef} width={baseSize} height={baseSize} className="w-full h-full rounded-xl shadow-lg bg-white/10" />
          </div>
          {logo && <img src={logo} alt="logo preview" className="w-24 h-24 object-cover rounded-full border border-white/30 shadow-2xl" />}
        </div>

      </div>
    </div>
  )
}
