"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

export default function EmailExtractor() {
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  function extractFromText(t: string) {
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

  async function copyToClipboard(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      alert(`Copied: ${email}`);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert("Failed to copy. Please try manually.");
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Panel */}
      <div className="space-y-4">
        <Label className="text-gray-300">Paste text</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text or upload a .txt file..."
          className="bg-white/5 text-gray-200 placeholder-gray-500"
          rows={10}
        />
        <div className="flex gap-3">
          <Button
            onClick={() => extractFromText(input)}
            className="bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Extract
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".txt"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button
              variant="default"
              className="bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Upload .txt
            </Button>
          </label>
        </div>
      </div>

      {/* Right Panel */}
      <div className="space-y-2">
        <Label className="text-gray-300">Found emails ({emails.length})</Label>
        <div className="bg-white/5 border border-white/10 rounded-md p-3 min-h-[180px] text-gray-200">
          {emails.length === 0 ? (
            <div className="opacity-60 italic">No emails found</div>
          ) : (
            <ul className="space-y-1">
              {emails.map((e) => (
                <li
                  key={e}
                  className="flex justify-between items-center group hover:bg-white/10 rounded-md px-2 py-1"
                >
                  <span className="truncate">{e}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(e)}
                      >
                        Copy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to copy</TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
