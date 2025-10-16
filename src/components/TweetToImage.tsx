import React, { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import twemoji from "twemoji";

export default function TweetToImage() {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const [tweetText, setTweetText] = useState(
    "Hello world! #tweetToImage @you 😊"
  );
  const [name, setName] = useState("Hanzlla Soomro");
  const [username, setUsername] = useState("hanzllasoomro");
  const [isVerified, setIsVerified] = useState(true);
  const [profileSrc, setProfileSrc] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [bgColor, setBgColor] = useState("");
  const [format, setFormat] = useState("png");
  const [scale, setScale] = useState(2);
  const [fileName, setFileName] = useState("tweet-card");

  // --- Formatting helpers ---
  function formatTweetToHTML(text) {
    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let escaped = escapeHtml(text);
    escaped = escaped.replace(
      /(#[\p{L}0-9_]+)/gu,
      '<span class="hashtag">$1</span>'
    );
    escaped = escaped.replace(
      /(@[\p{L}0-9_]+)/gu,
      '<span class="mention">$1</span>'
    );
    escaped = escaped.replace(
      /(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)/g,
      '<a href="$1" target="_blank" rel="noreferrer">$1</a>'
    );
    escaped = escaped.replace(/\n/g, "<br />");
    return escaped;
  }

  useEffect(() => {
    if (!textRef.current) return;
    textRef.current.innerHTML = formatTweetToHTML(tweetText);
    twemoji.parse(textRef.current, {
      folder: "svg",
      ext: ".svg",
      className: "twemoji",
    });
  }, [tweetText]);

  // --- Upload profile ---
  function onProfileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileSrc(url);
  }

  // --- Theme background ---
  function getBackgroundStyle() {
    if (bgColor) return { background: bgColor };
    switch (theme) {
      case "light":
        return { background: "#ffffff" };
      case "dark":
        return { background: "#0f172a" };
      case "gradient-1":
        return {
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        };
      case "gradient-2":
        return {
          background: "linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)",
        };
      default:
        return { background: "#0f172a" };
    }
  }

  // --- Export image ---
  async function exportCard() {
    if (!cardRef.current) return;
    const node = cardRef.current;
    const options = {
      cacheBust: true,
      pixelRatio: scale,
      style: { transform: "none" },
      useCORS: true,
    };
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

  function scaleLabel(s) {
    return s === 1
      ? "1x (standard)"
      : s === 2
      ? "2x (Retina)"
      : "4x (High-res)";
  }

  // --- JSX ---
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-sans"
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tweet Content */}
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold mb-3 text-white">
            Tweet content
          </h3>
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            className="w-full min-h-[120px] p-3 rounded-md bg-transparent border border-white/10 focus:outline-none text-white placeholder-white/50 resize-none"
            placeholder="Type tweet text here — supports hashtags, mentions, emojis..."
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-2 rounded-md bg-transparent border border-white/10 text-white"
              placeholder="Display name"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="sm:w-40 p-2 rounded-md bg-transparent border border-white/10 text-white"
              placeholder="username"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-white text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />{" "}
              Verified
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" accept="image/*" onChange={onProfileUpload} />{" "}
              Upload profile
            </label>
          </div>
        </div>

        {/* Right: Theme & Export */}
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold mb-3 text-white">
            Theme & Export
          </h3>
          <div className="flex flex-col gap-3 text-white">
            <div className="flex justify-between items-center">
              <label>Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="p-2 rounded-md bg-transparent border border-white/10 text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="gradient-1">Gradient 1</option>
                <option value="gradient-2">Gradient 2</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label>Custom BG</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 border border-white/20 rounded-md"
                />
                <button
                  onClick={() => setBgColor("")}
                  className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label>Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="p-2 rounded-md bg-transparent border border-white/10 text-sm"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label>Resolution</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="p-2 rounded-md bg-transparent border border-white/10 text-sm"
              >
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label>Filename</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 p-2 ml-2 rounded-md bg-transparent border border-white/10 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={exportCard}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
              >
                Export {format.toUpperCase()}
              </button>
              <button
                onClick={() => {
                  if (!cardRef.current) return;
                  htmlToImage
                    .toPng(cardRef.current, { pixelRatio: scale })
                    .then((dataUrl) => {
                      fetch(dataUrl)
                        .then((res) => res.blob())
                        .then((blob) =>
                          navigator.clipboard.write([
                            new ClipboardItem({ [blob.type]: blob }),
                          ])
                        )
                        .then(() => alert("Image copied to clipboard"))
                        .catch(() =>
                          alert("Copy failed — try Export instead.")
                        );
                    });
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="flex-1">
          <h4 className="mb-3 text-white font-semibold text-lg">
            Live Preview
          </h4>
          <div
            ref={cardRef}
            className="p-5 sm:p-6 rounded-2xl shadow-2xl tweet-card max-w-full w-full sm:w-[600px] mx-auto transition-all"
            style={{
              ...getBackgroundStyle(),
              color: theme === "light" ? "#000" : "#fff",
            }}
          >
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                {profileSrc ? (
                  <img
                    src={profileSrc}
                    alt="profile"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-xl font-semibold text-white/80">
                    {(name || "?").slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <div className="font-semibold text-[15px] leading-tight">
                    {name}
                  </div>
                  {isVerified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="#1DA1F2"
                    >
                      <path d="M22.5 12c0-5.8-4.7-10.5-10.5-10.5S1.5 6.2 1.5 12c0 5.8 4.7 10.5 10.5 10.5S22.5 17.8 22.5 12zM10.4 16.7l-3.4-3.4 1.4-1.4 2 2 4.8-4.8 1.4 1.4-6.2 6.2z" />
                    </svg>
                  )}
                  <div className="text-[15px] text-white/70">@{username}</div>
                </div>
                <div
                  ref={textRef}
                  className="mt-3 text-[18px] sm:text-[20px] leading-[28px] break-words"
                />
                <div className="flex items-center flex-wrap gap-3 mt-4 text-[14px] sm:text-[15px] text-white/60">
                  <div>2:34 PM · Oct 16, 2025</div>
                  <div>·</div>
                  <div>1,024 Likes</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/60 text-center sm:text-left">
            Tip: emojis are rendered via Twemoji (Twitter style), hashtags and
            mentions are auto-colored.
          </p>
        </div>

        {/* Preview Settings */}
        <div className="w-full lg:w-64">
          <h4 className="mb-3 text-white font-semibold text-lg">
            Preview Settings
          </h4>
          <div className="bg-white/5 p-4 sm:p-5 rounded-2xl text-white">
            <div className="mb-2 text-sm">Profile preview</div>
            {profileSrc ? (
              <img
                src={profileSrc}
                alt="profile preview"
                className="w-full h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-32 rounded-md bg-white/10 flex items-center justify-center text-sm">
                No profile image
              </div>
            )}
            <div className="mt-4 text-sm">
              <div className="mb-1">Hashtag / mention colors</div>
              <div className="flex gap-2 flex-wrap">
                <div className="px-2 py-1 rounded bg-white/10 text-sm hashtag inline-block">
                  #hashtag
                </div>
                <div className="px-2 py-1 rounded bg-white/10 text-sm mention inline-block">
                  @mention
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm space-y-1">
              <div>Resolution: {scaleLabel(scale)}</div>
              <div>Format: {format.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hashtag { color: #1DA1F2; font-weight: 600; }
        .mention { color: #9ca3af; font-weight: 600; }
        .twemoji { width: 1.25em; height: 1.25em; vertical-align: -0.25em; }
        a { text-decoration: underline; color: #1DA1F2; }
        .tweet-card * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
    </div>
  );
}
