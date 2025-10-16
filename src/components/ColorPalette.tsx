"use client";
import React, { useState } from "react";

// Very lightweight dominant color extractor — counts pixels and picks top colors.
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
    // reduce color space to speed up grouping (quantize by 16)
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
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default function ColorPalette() {
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);

  async function handleFile(f: File | null) {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = document.createElement("img");
    img.src = url;
    await img.decode();
    const pal = getDominantColors(img, 6);
    setColors(pal);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Upload image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(colors.join(","));
            }}
            className="px-4 py-2 rounded-md bg-white/10"
          >
            Copy HEXs
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4">
          {preview ? (
            <img
              src={preview}
              className="w-40 h-40 object-cover rounded-md shadow"
            />
          ) : (
            <div className="w-40 h-40 rounded-md border border-white/6 flex items-center justify-center">
              No image
            </div>
          )}
          <div className="flex-1">
            <div className="flex gap-2 flex-wrap">
              {colors.length === 0 ? (
                <div className="opacity-70">No palette yet</div>
              ) : (
                colors.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <div
                      style={{ background: c }}
                      className="w-12 h-12 rounded-md border"
                    />
                    <div>
                      <div className="font-mono">{c}</div>
                      <button
                        onClick={() => navigator.clipboard.writeText(c)}
                        className="text-xs mt-1 px-2 py-1 rounded bg-white/8"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
