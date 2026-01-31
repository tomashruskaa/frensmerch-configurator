import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const image = result.data?.[0];

    if (!image) {
      return Response.json({ error: "No image returned" }, { status: 500 });
    }

    // Vracíme buď base64 nebo url (podle toho, co model vrátí)
    return Response.json(
      { b64: (image as any).b64_json ?? null, url: (image as any).url ?? null },
      { status: 200 }
    );
  } catch (e: any) {
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
