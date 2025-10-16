import React, { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import * as emoji from "node-emoji";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function TweetToImagePremium() {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const fileInputRef = useRef(null);

  const [tweetText, setTweetText] = useState("Hello world! #tweetToImage @you 😊");
  const [name, setName] = useState("Hanzlla Soomro");
  const [username, setUsername] = useState("hanzllasoomro");
  const [isVerified, setIsVerified] = useState(true);
  const [profileSrc, setProfileSrc] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [bgColor, setBgColor] = useState("");
  const [format, setFormat] = useState("png");
  const [scale, setScale] = useState(2);
  const [fileName, setFileName] = useState("tweet-card");

  // Handle emoji and hashtag formatting
  function formatTweetToHTML(text) {
    const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/(#[\p{L}0-9_]+)/gu, '<span class="hashtag">$1</span>');
    escaped = escaped.replace(/(@[\p{L}0-9_]+)/gu, '<span class="mention">$1</span>');
    escaped = escaped.replace(/(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
    escaped = escaped.replace(/\n/g, "<br />");
    return escaped;
  }

  useEffect(() => {
    if (!textRef.current) return;
    const formatted = formatTweetToHTML(tweetText);
    const withEmojis = emoji.emojify(formatted, undefined, (code) => code);
    textRef.current.innerHTML = withEmojis;
  }, [tweetText]);

  function onProfileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileSrc(url);
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
    const node = cardRef.current;
    const options = { cacheBust: true, pixelRatio: scale, style: { transform: "none" }, useCORS: true };
    try {
      await new Promise((res) => setTimeout(res, 500));
      const method = format === "png" ? htmlToImage.toPng : htmlToImage.toJpeg;
      const dataUrl = await method(node, { ...options, quality: 0.92 });
      const blob = dataURLToBlob(dataUrl);
      saveAs(blob, `${fileName}.${format}`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed — see console for details.");
    }
  }

  function dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

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

              <Button onClick={exportCard} className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition text-white">
                Export {format.toUpperCase()}
              </Button>
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
