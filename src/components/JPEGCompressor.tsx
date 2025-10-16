"use client";
import React, { useState } from "react";

export default function JPEGCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function compress() {
    if (!file) return;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", quality)
    );
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `compressed.jpg`;
    a.click();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload image (JPEG / PNG)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        <label className="block text-sm font-medium mt-4 mb-2">
          Quality: {Math.round(quality * 100)}%
        </label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={compress}
            className="px-4 py-2 rounded-md bg-white/10"
          >
            Compress & Download
          </button>
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="px-4 py-2 rounded-md bg-white/5"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="max-w-full rounded-md shadow-md"
          />
        ) : (
          <div className="p-6 rounded-md border border-white/6">
            No image selected
          </div>
        )}
      </div>
    </div>
  );
}
