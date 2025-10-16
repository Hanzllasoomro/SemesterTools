"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/tools/separator";
import { cn } from "@/lib/utils";

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
    <div className="grid md:grid-cols-2 gap-8">
      {/* Upload Section */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <UploadCloud className="text-indigo-400" /> JPEG Compressor
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Box */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
              "bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-indigo-950/30 hover:to-purple-950/30"
            )}
            onClick={() => document.getElementById("imgInput")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            <UploadCloud
              className="mx-auto mb-3 text-indigo-400 group-hover:text-indigo-300 transition"
              size={42}
            />
            <p className="text-gray-200 text-sm">
              Drag & drop your image here or{" "}
              <span className="text-indigo-400 font-medium underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Supports PNG, JPG up to 10MB
            </p>
            <input
              id="imgInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </motion.div>

          {/* File Preview */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <ImageIcon className="text-indigo-400" size={20} />
              <span className="text-gray-300 text-sm truncate">
                {file?.name}
              </span>
            </motion.div>
          )}

          <Separator className="bg-white/10 my-4" />

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Quality</span>
              <span className="text-indigo-400 font-semibold">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[quality]}
              min={0.1}
              max={1}
              step={0.05}
              onValueChange={(val) => setQuality(val[0])}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="default"
              onClick={compress}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
              Compress & Download
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="flex-1 text-gray-300 hover:bg-white/10"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {preview ? (
          <motion.img
            key={preview}
            src={preview}
            alt="Preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-full max-h-[500px] rounded-xl shadow-lg border border-white/10"
          />
        ) : (
          <div className="text-gray-500 text-sm p-6 border border-white/10 rounded-xl">
            No image selected
          </div>
        )}
      </motion.div>
    </div>
  );
}
