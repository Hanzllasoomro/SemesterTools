"use client";

import React, { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import * as emoji from "node-emoji";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function TweetToImagePremium() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tweetText, setTweetText] = useState("Hello world! #tweetToImage @you 😊");
  const [name, setName] = useState("Hanzlla Soomro");
  const [username, setUsername] = useState("hanzllasoomro");
  const [isVerified, setIsVerified] = useState(true);
  const [profileSrc, setProfileSrc] = useState<string | null>(null);
  const [theme, setTheme] = useState("dark");
  const [bgColor, setBgColor] = useState("");
  const [format, setFormat] = useState("png");
  const [scale, setScale] = useState(2);
  const [fileName, setFileName] = useState("tweet-card");
  const [isExporting, setIsExporting] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number; } | null>(null);

  // Update dimensions whenever scale changes or on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = Math.ceil(rect.width) * scale;
      const height = Math.ceil(rect.height) * scale;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [scale]);

  // Handle emoji and hashtag formatting
  function formatTweetToHTML(text: string) {
    const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/(#[\p{L}0-9_]+)/gu, '<span class="hashtag">$1</span>');
    escaped = escaped.replace(/(@[\p{L}0-9_]+)/gu, '<span class="mention">$1</span>');
    escaped = escaped.replace(/(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
    escaped = escaped.replace(/\n/g, "<br />");
    return escaped;
  }

  useEffect(() => {
    if (!textRef.current) return;
    try {
      const formatted = formatTweetToHTML(tweetText);
  // node-emoji's emojify takes a string and an optional lookup map; using default behavior
  const withEmojis = emoji.emojify(formatted as string);
      // Assign innerHTML in a controlled way; fallback to textContent on error
      textRef.current.innerHTML = withEmojis;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to render tweet text", e);
      textRef.current.textContent = tweetText;
    }
  }, [tweetText]);

  function onProfileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to data URL instead of blob URL to avoid CORS issues
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfileSrc((prev) => {
        // Clean up previous blob URL if it exists
        if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
          try { URL.revokeObjectURL(prev); } catch (_) { }
        }
        return dataUrl;
      });
    };
    reader.onerror = () => {
      alert("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  }

  function getBackgroundStyle() {
    if (bgColor) return { background: bgColor, color: theme === "light" ? "#000" : "#fff" };
    switch (theme) {
      case "light": return { background: "#ffffff", color: "#000" };
      case "dark": return { background: "#15202b", color: "#fff" };
      case "gradient-1": return { background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "#fff" };
      case "gradient-2": return { background: "linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)", color: "#000" };
      default: return { background: "#15202b", color: "#fff" };
    }
  }

  async function exportCard() {
    if (!cardRef.current) return;
    setIsExporting(true);
    const node = cardRef.current;
    
    try {
      // Get the exact dimensions including padding, borders, and any overflow
      const rect = node.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(node);
      
      // Parse all possible dimensions that could affect size
      const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
      const paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
      const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
      const paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
      const borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
      const borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
      const borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0;
      const borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0;
      
      // Calculate content box dimensions
      const contentWidth = rect.width - paddingLeft - paddingRight - borderLeft - borderRight;
      const contentHeight = rect.height - paddingTop - paddingBottom - borderTop - borderBottom;
      
      // Add a small safety margin and round up to nearest pixel
      const safetyMargin = 2; // 2px safety margin
      const width = Math.ceil(rect.width + safetyMargin * 2);
      const height = Math.ceil(rect.height + safetyMargin * 2);
      
      // Calculate high-DPI dimensions based on scale
      const canvasWidth = width * scale;
      const canvasHeight = height * scale;
      
      // Log dimensions for debugging
      console.debug('Export dimensions:', {
        rect: { width: rect.width, height: rect.height },
        computed: { 
          content: { width: contentWidth, height: contentHeight },
          padding: { top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft },
          border: { top: borderTop, right: borderRight, bottom: borderBottom, left: borderLeft }
        },
        final: { 
          width, height,
          canvasWidth, canvasHeight,
          scale,
          pixelRatio: window.devicePixelRatio
        }
      });
      
      const options: Record<string, any> = { 
        cacheBust: true,
        pixelRatio: scale,
        style: { 
          transform: "none",
          margin: `${safetyMargin}px`,
        },
        skipAutoScale: true,
        quality: 0.92,
        width,
        height,
        canvasWidth,
        canvasHeight,
      };

      // Ensure layout is stable and scrolled into view
      node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      // Wait a bit longer for layout to stabilize
      await new Promise((res) => setTimeout(res, 250));

      const method = format === "png" ? htmlToImage.toPng : htmlToImage.toJpeg;
      const dataUrl = await method(node, options);
      const blob = dataURLToBlob(dataUrl);
      saveAs(blob, `${fileName}.${format}`);
    } catch (err) {
      console.error("Export failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Export failed: ${errMsg}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }

  function getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  }

  // Wait for images inside `root` to be complete or until timeoutms elapses
  function waitForImagesToLoad(root: HTMLElement, timeoutMs = 5000) {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    if (imgs.length === 0) return Promise.resolve();

    // Log image info
    console.debug('Images to wait for:', imgs.map(img => ({
      src: img.src.substring(0, 100) + (img.src.length > 100 ? '...' : ''),
      complete: img.complete,
      naturalSize: img.complete ? { width: img.naturalWidth, height: img.naturalHeight } : null,
      displaySize: { width: img.offsetWidth, height: img.offsetHeight }
    })));

    const watchers = imgs.map((img) => {
      return new Promise<void>((res) => {
        if (img.complete) {
          console.debug('Image already loaded:', {
            src: img.src.substring(0, 100) + (img.src.length > 100 ? '...' : ''),
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight }
          });
          return res();
        }

        const onDone = () => { 
          console.debug('Image loaded:', {
            src: img.src.substring(0, 100) + (img.src.length > 100 ? '...' : ''),
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight }
          });
          cleanup(); 
          res(); 
        };
        const onErr = () => { 
          console.warn('Image load failed:', img.src);
          cleanup(); 
          res(); 
        };
        const cleanup = () => { 
          img.removeEventListener('load', onDone); 
          img.removeEventListener('error', onErr); 
        };
        
        img.addEventListener('load', onDone);
        img.addEventListener('error', onErr);
      });
    });

    return Promise.race([
      Promise.all(watchers),
      new Promise<void>((res) => {
        setTimeout(() => {
          console.warn('Image loading timed out after', timeoutMs, 'ms');
          res();
        }, timeoutMs);
      }),
    ]).then(() => {
      // Final size check
      imgs.forEach(img => {
        if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
          console.warn('Image loaded but has zero dimensions:', img.src);
        }
      });
    });
  }

  function dataURLToBlob(dataUrl: string) {
    const arr = dataUrl.split(",");
    const metaMatch = arr[0].match(/:(.*?);/);
    const mime = metaMatch?.[1] ?? "image/png";
    const b64 = arr[1] ?? "";
    const bstr = atob(b64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (profileSrc && typeof profileSrc === "string" && profileSrc.startsWith("blob:")) {
        try { URL.revokeObjectURL(profileSrc); } catch (_) { }
      }
    };
  }, [profileSrc]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Tweet Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/80 p-6 hover:shadow-xl transition-all">
          <CardContent>
            <h3 className="text-xl font-semibold mb-4 text-white">Tweet Content</h3>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="Type your tweet here..."
              className={`w-full min-h-[120px] p-3 rounded-xl border text-lg resize-none focus:outline-none focus:ring-2 transition
                ${theme === "light" ? "bg-white border-gray-300 text-black placeholder-gray-500 focus:ring-blue-500" 
                : "bg-gray-800/70 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-400"}`}
            />
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display Name"
                className={`${theme === "light" ? "bg-white text-black placeholder-gray-500" : "bg-gray-800/70 text-white placeholder-gray-400"}`}
              />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className={`${theme === "light" ? "bg-white text-black placeholder-gray-500" : "bg-gray-800/70 text-white placeholder-gray-400"}`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
                Verified
              </label>

              {/* Shadcn Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                Upload Profile
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onProfileUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme & Export */}
        <Card className="bg-gray-900/80 p-6 hover:shadow-xl transition-all">
          <CardContent>
            <h3 className="text-xl font-semibold mb-4 text-white">Theme & Export</h3>
            <div className="space-y-4 text-white">
              <div className="flex justify-between items-center">
                <label>Theme</label>
                <Select value={theme} onValueChange={(v) => setTheme(v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Select theme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="gradient-1">Gradient 1</SelectItem>
                    <SelectItem value="gradient-2">Gradient 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <label>Format</label>
                <Select value={format} onValueChange={(v) => setFormat(v)}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Select format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <label>Resolution</label>
                <Select value={scale.toString()} onValueChange={(v) => setScale(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Select resolution" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x (Retina)</SelectItem>
                    <SelectItem value="4">4x (High-res)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Filename"
                className={`${theme === "light" ? "bg-white text-black placeholder-gray-500" : "bg-gray-800/70 text-white placeholder-gray-400"}`}
              />

              <div className="relative group">
                <Button 
                  onClick={exportCard} 
                  disabled={isExporting}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition text-white"
                >
                  {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
                </Button>
                {dimensions && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Output size: {dimensions.width}×{dimensions.height}px
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Live Preview */}
      <h4 className="text-white font-semibold text-lg">Live Preview</h4>
      <Card ref={cardRef} className="p-6 max-w-xl mx-auto rounded-2xl shadow-2xl transition-all hover:shadow-3xl" style={getBackgroundStyle()}>
        <CardContent>
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-700/50 flex items-center justify-center text-white text-2xl">
              {profileSrc ? <img src={profileSrc} className="w-full h-full object-cover rounded-full" crossOrigin="anonymous" /> : (name || "?")[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{name}</span>
                {isVerified && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12c0-5.8-4.7-10.5-10.5-10.5S1.5 6.2 1.5 12c0 5.8 4.7 10.5 10.5 10.5S22.5 17.8 22.5 12zM10.4 16.7l-3.4-3.4 1.4-1.4 2 2 4.8-4.8 1.4 1.4-6.2 6.2z" />
                  </svg>
                )}
              </div>
              <div className="text-gray-400 text-sm">@{username}</div>
              <div ref={textRef} className="mt-3 text-lg leading-7 break-words" />
              <div className="flex gap-4 mt-4 text-gray-400 text-sm">
                <span>2:34 PM · Oct 16, 2025</span>
                <span>·</span>
                <span>1,024 Likes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style>{`
        .hashtag { color: #1DA1F2; font-weight: 600; }
        .mention { color: #9CA3AF; font-weight: 600; }
        a { color: #1DA1F2; text-decoration: underline; }
      `}</style>
    </div>
  );
}
