import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const form = await req.formData();
    const style = String(form.get("style") || "anime");
    const file = form.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/png";
    const b64in = bytes.toString("base64");

    const customPrompt = String(form.get("customPrompt") || "").trim();


    const styleMap: Record<string, string> = {
      simpsons: "Simpsons-style cartoon portrait, flat colors, thick outlines.",
      anime: "Anime portrait, clean lineart, vibrant colors.",
      tokyo: "Tokyo Revengers-style anime portrait, dramatic lighting.",
      pixar: "3D animated film look, soft lighting, detailed shading.",
      gta: [
  "Rockstar Games / GTA V official key art illustration style (NOT anime).",
  "Clean vector-like ink lines, sharp edges, cel-shaded painting, high contrast.",
  "Cinematic warm sunset lighting, vibrant Miami/Vice City palette.",
  "Poster composition, dramatic but realistic proportions (no big anime eyes).",
  "Face and identity must match the original photo exactly.",
  "NO text, NO logos, NO game UI, NO watermarks, NO captions.",
  "Background: simplified city street with palm trees and art-deco buildings OR simple gradient if uncertain."
].join(" "),
    };

    const prompt =
  `Transform the person in the input photo into this style: ${styleMap[style] || styleMap.anime}. ` +
  `Keep the same identity, face features, hairstyle and pose. ` +
  `Do not change clothing unless requested. ` +
  `Output: a single image only. ` +
  `Hard rules: NO text, NO UI/HUD, NO borders, NO watermarks, NO logos. ` +
  (customPrompt ? `Additional instructions: ${customPrompt}` : "");


    const ai = new GoogleGenAI({ apiKey });

    const resp: any = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: b64in } },
        ],
      },
    });

    const parts = resp?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p?.inlineData?.data);

    if (!imgPart) {
      return Response.json({ error: "No image returned" }, { status: 500 });
    }

    const outMime = imgPart.inlineData.mimeType ?? "image/png";
    const outB64 = imgPart.inlineData.data as string;

    // vyber příponu podle mime
    const ext =
      outMime.includes("png") ? "png" :
      (outMime.includes("jpeg") || outMime.includes("jpg")) ? "jpg" :
      "png";

    const id = crypto.randomUUID();
    const filename = `${id}.${ext}`;

    // uložit do public/uploads
const uploadDir = path.join(process.cwd(), "public", "uploads");
     await fs.mkdir(uploadDir, { recursive: true });

    const outPath = path.join(uploadDir, filename);
    await fs.writeFile(outPath, Buffer.from(outB64, "base64"));

const url = `https://configurator.frensmerch.com/frensmerch-configurator/public/uploads/${filename}`;

    // vrátíme url + id (a b64 klidně pro preview)
    return Response.json({
      id,
      url,
      mime: outMime,
      b64: outB64,
      style,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
