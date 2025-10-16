"use client";

import React, { useState } from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

function getDominantColors(img: HTMLImageElement, count = 6) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const w = Math.min(img.naturalWidth, 400);
  const h = Math.min(img.naturalHeight, 400);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const map = new Map<string, number>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const rq = Math.round(r / 16) * 16;
    const gq = Math.round(g / 16) * 16;
    const bq = Math.round(b / 16) * 16;
    const key = `${rq},${gq},${bq}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, count).map(([k]) => {
    const [r, g, b] = k.split(",").map(Number);
    return rgbToHex(r, g, b);
  });
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export default function ColorPalette() {
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const pal = getDominantColors(img, 6);
      setColors(pal);
      setLoading(false);
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 p-6">
      {/* Upload Section */}
      <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Upload an Image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Custom File Upload Button */}
          <div
            className="w-full p-6 rounded-xl border-2 border-dashed border-gray-500 hover:border-indigo-500 transition-all text-center flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800/40 to-slate-900/40 hover:from-indigo-900/30 hover:to-purple-900/30 cursor-pointer"
            onClick={() => document.getElementById("fileInput")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            <UploadCloud className="text-indigo-400" size={38} />
            <span className="text-gray-300 font-medium">
              Drag & drop your image here or browse
            </span>
            <span className="text-gray-500 text-xs mt-1">
              PNG, JPG, or JPEG (max 5MB)
            </span>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </div>

          {preview && (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <ImageIcon className="text-indigo-400" size={20} />
              <span className="text-gray-300 text-sm truncate">
                {preview.split("/").pop()}
              </span>
            </div>
          )}

          <Tooltip
            open={copied === colors.join(", ")}
            onOpenChange={() => setCopied(null)}
          >
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="lg"
                disabled={colors.length === 0}
                onClick={() => copyToClipboard(colors.join(", "))}
              >
                Copy All HEX Codes
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copied!</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Palette Section */}
      <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Extracted Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5 mb-6">
            {loading ? (
              <Skeleton className="w-40 h-40 rounded-xl" />
            ) : preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded-xl shadow-md border border-white/10"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center rounded-xl border border-white/10 text-gray-400">
                No image
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm">
                {colors.length > 0
                  ? `${colors.length} colors detected`
                  : "Upload an image to extract colors"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {colors.length === 0 ? (
              <div className="col-span-full text-gray-500 italic text-sm text-center py-6">
                No colors extracted yet
              </div>
            ) : (
              colors.map((c) => (
                <Tooltip key={c} open={copied === c}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center justify-between bg-white/5 border border-white/10 
                      rounded-xl p-3 min-h-[120px] transition-all hover:scale-105 cursor-pointer"
                      onClick={() => copyToClipboard(c)}
                    >
                      <div
                        className="w-16 h-16 rounded-md shadow-sm"
                        style={{ background: c }}
                      />
                      <span className="mt-2 font-mono text-sm text-gray-200">
                        {c}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Copied!</TooltipContent>
                </Tooltip>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
