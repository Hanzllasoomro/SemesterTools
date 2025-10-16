"use client";
import React, { useState } from "react";

export default function EmailExtractor() {
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  function extractFromText(t: string) {
    // robust email regex (simple, practical)
    const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const found = t.match(re) || [];
    const unique = Array.from(new Set(found));
    setEmails(unique);
  }

  async function handleFile(f: File | null) {
    if (!f) return;
    const txt = await f.text();
    setInput(txt);
    extractFromText(txt);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Paste text</label>
        <textarea
          rows={10}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 rounded-md bg-white/6"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => extractFromText(input)}
            className="px-4 py-2 rounded-md bg-white/10"
          >
            Extract
          </button>
          <label className="px-4 py-2 rounded-md bg-white/5 cursor-pointer">
            Upload .txt
            <input
              type="file"
              accept=".txt"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Found emails ({emails.length})
        </label>
        <div className="bg-white/6 rounded-md p-3 min-h-[180px]">
          {emails.length === 0 ? (
            <div className="opacity-70">No emails found</div>
          ) : (
            <ul className="list-disc pl-5">
              {emails.map((e) => (
                <li key={e} className="flex justify-between items-center">
                  <span>{e}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(e)}
                    className="text-xs px-2 py-1 rounded bg-white/8"
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
