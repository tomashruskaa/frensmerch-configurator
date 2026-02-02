import { GoogleGenAI } from "@google/genai";

const STYLE_MAP: Record<string, string> = {
  simpsons: "Simpsons-style cartoon portrait, flat colors, thick outlines.",
  anime: "Anime portrait, clean lineart, vibrant colors.",
  tokyo: "Tokyo Revengers-style anime portrait, dramatic lighting.",
  pixar: "3D animated film look, soft lighting, detailed shading (Pixar-like).",
  gta: "GTA V / Rockstar illustration style, sharp outlines, high contrast, cinematic lighting, poster-like composition.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const style = String(body?.style || "").trim(); // volitelné
    const customPrompt = String(body?.customPrompt || "").trim(); // volitelné

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const styleText = style ? (STYLE_MAP[style] || style) : "";
    const finalPrompt =
      (styleText ? `Style: ${styleText}\n` : "") +
      `Task: ${prompt}\n` +
      (customPrompt ? `Additional instructions: ${customPrompt}\n` : "") +
      `Output: a single image.`;

    const ai = new GoogleGenAI({ apiKey });

    const resp: any = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts: [{ text: finalPrompt }] },
    });

    const parts = resp?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p?.inlineData?.data);

    if (!imgPart) {
      return Response.json({ error: "No image returned" }, { status: 500 });
    }

    return Response.json({
      mime: imgPart.inlineData.mimeType ?? "image/png",
      b64: imgPart.inlineData.data,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
