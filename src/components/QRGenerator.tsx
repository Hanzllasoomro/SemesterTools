'use client'
import React, { useRef, useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function QRGenerator(){
  const [text,setText] = useState('https://hanzllasoomro.vercel.app/')
  const [fgColor,setFgColor] = useState('#000000')
  const [bgColor,setBgColor] = useState('#ffffff')
  const [scale,setScale] = useState(1) // visual scaling (max 1 = 100%)
  const [logo, setLogo] = useState<string | null>(null)
  const [rounded, setRounded] = useState(true)
  const [transparentBg, setTransparentBg] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement|null>(null)

  const baseSize = 350
  useEffect(() => {
    generate()
  }, [])

  async function generate(){
    const canvas = canvasRef.current
    if(!canvas) return
    const effectiveBg = transparentBg ? undefined : bgColor
    await QRCode.toCanvas(canvas, text, {
      width: baseSize,
      margin: 1,
      color: {dark: fgColor, light: effectiveBg || '#ffffff'},
    })

    const ctx = canvas.getContext('2d')!
    if(rounded){
      const imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
      const data = imageData.data
      const radius = 2
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4
          if (data[i] < 128 && ((x < radius || x > canvas.width-radius) || (y < radius || y > canvas.height-radius))) {
            data[i+3] = 0
          }
        }
      }
      ctx.putImageData(imageData,0,0)
    }

    if(logo){
      const img = new Image()
      img.src = logo
      await img.decode()
      const logoSize = baseSize * 0.2
      const radius = 12
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(baseSize/2 - logoSize/2, baseSize/2 - logoSize/2, logoSize, logoSize, radius)
      ctx.clip()
      ctx.drawImage(img, baseSize/2 - logoSize/2, baseSize/2 - logoSize/2, logoSize, logoSize)
      ctx.restore()
    }
  }

  function handleLogo(f:File|null){
    if(!f) return
    setLogo(URL.createObjectURL(f))
  }

  async function download(format:'png'|'svg'){
    const canvas = canvasRef.current
    if(!canvas) return
    if(format==='png'){
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'qr.png'
      a.click()
    } else {
      const svg = await QRCode.toString(text, {type:'svg', color:{dark:fgColor, light:bgColor}})
      const blob = new Blob([svg], {type:'image/svg+xml'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr.svg'
      a.click()
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Text / URL</label>
        <input value={text} onChange={e=>setText(e.target.value)} className="w-full p-3 rounded-md bg-white/6" />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs mb-1">Foreground</label>
            <input type="color" value={fgColor} onChange={e=>setFgColor(e.target.value)} className="w-full cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs mb-1">Background</label>
            <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-full cursor-pointer" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs mb-1">Preview Scale ({(scale * 100).toFixed(0)}%)</label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={scale}
            onChange={e=>setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rounded} onChange={e=>setRounded(e.target.checked)} /> Rounded Modules
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={transparentBg} onChange={e=>setTransparentBg(e.target.checked)} /> Transparent Background
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-xs mb-1">Logo overlay (optional)</label>
          <input type="file" accept="image/*" onChange={e=>handleLogo(e.target.files?.[0]||null)} />
        </div>

        <div className="flex gap-2 mt-5 flex-wrap">
          <button onClick={generate} className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 text-white">Generate</button>
          <button onClick={()=>download('png')} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">Download PNG</button>
          <button onClick={()=>download('svg')} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">Download SVG</button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className="relative flex items-center justify-center bg-white/10 rounded-2xl p-4 shadow-lg"
          style={{
            width: 'min(90vw, 350px)',
            height: 'min(90vw, 350px)',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease',
          }}
        >
          <canvas
            ref={canvasRef}
            width={baseSize}
            height={baseSize}
            className="w-full h-full rounded-xl bg-white"
          />
        </div>
        {logo && <img src={logo} alt="logo preview" className="w-16 h-16 object-cover rounded-full border border-white/20 shadow-md" />}
      </div>
    </div>
  )
}
