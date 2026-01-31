"use client";
import { useMemo, useState } from "react";

type StyleKey = "tokyo" | "anime" | "simpsons" | "pixar" | "gta";

const STYLES: Record<StyleKey, string> = {
  simpsons: "Simpsons-style cartoon portrait, flat colors, thick outlines.",
  anime: "Anime portrait, clean lineart, vibrant colors.",
  tokyo: "Tokyo Revengers-style anime portrait, dramatic lighting.",
  pixar: "3D animated film look, soft lighting, detailed shading (Pixar-like).",
  gta: "GTA V / Rockstar illustration style, sharp outlines, high contrast, cinematic lighting, poster-like composition.",
};


type DraftOrder = {
  draftOrderId: string;
  createdAt: number;
  style: StyleKey;
  originalFileName: string;
  generatedImageUrl: string;
  generatedImageId?: string;
};

function makeDraftId() {
  // jednoduchý id generator pro prototyp
  return `draft_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<StyleKey>("tokyo");
  const [loading, setLoading] = useState(false);

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftOrder | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [customPrompt, setCustomPrompt] = useState("");


  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

async function generate() {
  setLoading(true);
  setError(null);
  setImgSrc(null);
  setSavedUrl(null);
  setDraft(null);

  try {
    if (!file) throw new Error("Nahraj fotku.");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("style", style);
    fd.append("customPrompt", customPrompt);

    const res = await fetch("/api/transform-gemini", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");

    // ✅ uděláme si finální URL, které bude fungovat i v Shopify (absolutní)
    let finalUrl: string | null = null;

    if (data.url) {
      finalUrl = new URL(data.url, window.location.origin).toString();
      setImgSrc(finalUrl);
      setSavedUrl(finalUrl);

      // ✅ pošli zprávu do Shopify (parent okno)
      const isShopify = new URLSearchParams(window.location.search).get("shopify") === "1";
      const designId =
        (typeof data.id === "string" && data.id) ||
        (finalUrl.split("/").pop() ?? String(Date.now()));

      if (isShopify && window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "FM_DESIGN_READY", designUrl: finalUrl, designId },
          "*"
        );
        console.log("[FM] sent FM_DESIGN_READY", { finalUrl, designId });
      }
    } else if (data.b64) {
      // fallback: base64 preview (tohle do Shopify overlay nedávej, proto neposíláme postMessage)
      setImgSrc(`data:${data.mime || "image/png"};base64,${data.b64}`);
    } else {
      throw new Error("No image returned");
    }

    // 2) simulace objednávky = uložit draft do localStorage
    const draftOrder: DraftOrder = {
      draftOrderId: makeDraftId(),
      createdAt: Date.now(),
      style,
      originalFileName: file.name,
      generatedImageUrl: finalUrl || "",
      generatedImageId: data.id,
    };

    localStorage.setItem("fm_draft_order", JSON.stringify(draftOrder));
    setDraft(draftOrder);
  } catch (e: any) {
    setError(e?.message ?? String(e));
  } finally {
    setLoading(false);
  }
}


  function loadDraft() {
    setError(null);
    try {
      const raw = localStorage.getItem("fm_draft_order");
      if (!raw) {
        setDraft(null);
        setSavedUrl(null);
        return;
      }
      const parsed = JSON.parse(raw) as DraftOrder;
      setDraft(parsed);
      setSavedUrl(parsed.generatedImageUrl || null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  function clearDraft() {
    localStorage.removeItem("fm_draft_order");
    setDraft(null);
    setSavedUrl(null);
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>FM Proto – photo → style</h1>

      <div style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <select value={style} onChange={(e) => setStyle(e.target.value as StyleKey)}>
          <option value="tokyo">Tokyo Revengers</option>
          <option value="anime">Anime</option>
          <option value="simpsons">Simpsons</option>
          <option value="pixar">3D film look</option>
          <option value="gta">GTA (Rockstar poster)</option>

        </select>

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 6, opacity: 0.8 }}>Custom prompt (volitelné):</div>
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder='např. "make background neon city, add subtle grain"'
            style={{ width: "100%", maxWidth: 640, padding: 10 }}
          />
        </div>


        <button onClick={generate} disabled={loading} style={{ padding: "10px 14px" }}>
          {loading ? "Generating..." : "Generate"}
        </button>

        <button onClick={loadDraft} style={{ padding: "10px 14px" }}>
          Load saved draft
        </button>

        <button onClick={clearDraft} style={{ padding: "10px 14px" }}>
          Clear draft
        </button>
      </div>

      {previewUrl && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, opacity: 0.8 }}>Original preview:</div>
          <img src={previewUrl} alt="Original" style={{ width: 256, borderRadius: 10 }} />
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

      {imgSrc && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, opacity: 0.8 }}>Generated:</div>
          <img src={imgSrc} alt="Generated" style={{ width: 512, borderRadius: 10 }} />
        </div>
      )}

      {(draft || savedUrl) && (
        <div style={{ marginTop: 20, padding: 12, border: "1px solid #333", borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Order draft (simulace)</div>

          {draft ? (
            <>
              <div><b>draftOrderId:</b> {draft.draftOrderId}</div>
              <div><b>style:</b> {draft.style}</div>
              <div><b>originalFileName:</b> {draft.originalFileName}</div>
              <div><b>generatedImageId:</b> {draft.generatedImageId ?? "-"}</div>
              <div style={{ marginTop: 8 }}>
                <b>generatedImageUrl:</b>{" "}
                <a href={draft.generatedImageUrl} target="_blank" rel="noreferrer">
                  {draft.generatedImageUrl}
                </a>
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.8 }}>
              Draft není v paměti komponenty, ale URL je uložená:{" "}
              <a href={savedUrl ?? ""} target="_blank" rel="noreferrer">
                {savedUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
