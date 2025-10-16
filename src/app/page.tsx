'use client'
import React, { useState } from 'react'
import TweetToImage from '../components/TweetToImage'
import JPEGCompressor from '../components/JPEGCompressor'
import QRGenerator from '../components/QRGenerator'
import EmailExtractor from '../components/EmailExtractor'
import ColorPalette from '../components/ColorPalette'


export default function Home() {
const [tool, setTool] = useState('tweet')
return (
<main>
<nav className="flex gap-2 mb-6 flex-wrap">
<ToolButton active={tool==='tweet'} onClick={()=>setTool('tweet')}>Tweet → Image</ToolButton>
<ToolButton active={tool==='jpeg'} onClick={()=>setTool('jpeg')}>JPEG Compressor</ToolButton>
<ToolButton active={tool==='qr'} onClick={()=>setTool('qr')}>QR Generator</ToolButton>
<ToolButton active={tool==='emails'} onClick={()=>setTool('emails')}>Email Extractor</ToolButton>
<ToolButton active={tool==='palette'} onClick={()=>setTool('palette')}>Color Palette</ToolButton>
</nav>


<section className="bg-white/6 rounded-2xl p-6 shadow-lg">
{tool==='tweet' && <TweetToImage />}
{tool==='jpeg' && <JPEGCompressor />}
{tool==='qr' && <QRGenerator />}
{tool==='emails' && <EmailExtractor />}
{tool==='palette' && <ColorPalette />}
</section>
</main>
)
}


function ToolButton({children,onClick,active}:{children:React.ReactNode,onClick:()=>void,active:boolean}){
return (
<button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium ${active ? 'bg-white/10' : 'bg-white/5'} hover:bg-white/12`}>{children}</button>
)
}