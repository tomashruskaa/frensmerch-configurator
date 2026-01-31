import Link from "next/link";

const PRODUCT_BY_SLUG: Record<string, { name: string; price: number; desc: string }> = {
  "t-shirt": {
    name: "T-SHIRT",
    price: 25,
    desc:
      "Upload your photo → pick a style → we print your custom artwork. (UI prototype)",
  },
  hoodie: { name: "SWEATSHIRT", price: 30, desc: "Warm hoodie + your AI artwork. (UI prototype)" },
  mug: { name: "MUG", price: 15, desc: "Mug with your AI artwork. (UI prototype)" },
  notebook: { name: "NOTEBOOK", price: 10, desc: "Notebook cover with your AI artwork. (UI prototype)" },
};

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["#000000", "#ffffff", "#a3a3a3", "#facc15", "#60a5fa", "#a78bfa"];

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PRODUCT_BY_SLUG[slug] ?? PRODUCT_BY_SLUG["t-shirt"];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header mini */}
      <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-wider">FRENSMERCH</Link>
        <nav className="flex gap-5 text-sm opacity-90">
          <Link href="/" className="hover:opacity-80">HOME</Link>
          <Link href="/products" className="hover:opacity-80">PRODUCTS</Link>
          <Link href="/configurator" className="hover:opacity-80">CONFIGURATOR</Link>
        </nav>
      </header>

      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Mock product preview */}
          <div>
            <div className="text-3xl font-black">{p.name}</div>
            <div className="text-sm opacity-70 mt-1">Design your own!</div>

            <div className="mt-6 rounded-xl overflow-hidden border border-neutral-800 bg-lime-400 p-8">
              <div className="bg-neutral-900/40 rounded-lg p-6 flex items-center justify-center">
                <div className="w-[280px] h-[320px] bg-neutral-800 rounded-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-60 text-sm">
                    product mock
                  </div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 px-2 py-1 rounded">←</div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 px-2 py-1 rounded">→</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm opacity-80">
              Product description:
              <div className="mt-2 opacity-70">{p.desc}</div>
            </div>
          </div>

          {/* Configurator panel (UI only) */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/30 p-6 h-fit">
            <div className="font-black text-lg">DESIGN YOUR OWN {p.name}!</div>

            <div className="mt-5">
              <div className="text-xs opacity-70 mb-2">Size:</div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className="px-3 py-2 rounded border border-neutral-700 hover:border-neutral-500 text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs opacity-70 mb-2">Colour:</div>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded border border-neutral-700 hover:border-neutral-500"
                    style={{ background: c }}
                    aria-label={`color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-neutral-700 rounded">
                <button className="px-3 py-2">-</button>
                <div className="px-3 py-2 border-x border-neutral-700">1</div>
                <button className="px-3 py-2">+</button>
              </div>
              <button className="flex-1 px-4 py-3 rounded bg-white text-black font-bold">
                Add to cart
              </button>
            </div>

            <div className="mt-5">
              <Link
                href="/configurator"
                className="block text-center px-4 py-3 rounded bg-black border border-lime-400 text-lime-400 font-extrabold"
              >
                DESIGN YOUR OWN WITH FRENSMERCH CONFIGURATOR!
              </Link>
              <div className="text-xs opacity-60 mt-2">
                (zatím jen link na tvoji /configurator stránku)
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-800 text-sm opacity-80">
              <div className="font-bold opacity-100">Price:</div>
              <div className="mt-1">{p.price} USD</div>
            </div>
          </div>
        </div>

        {/* You may also like */}
        <div className="mt-14 border-t border-neutral-800 pt-10">
          <div className="font-black text-lg">YOU MAY ALSO LIKE…</div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {["t-shirt", "hoodie", "mug", "notebook"].map((s) => (
              <Link
                key={s}
                href={`/products/${s}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-neutral-600 transition"
              >
                <div className="h-32 bg-lime-400 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-lg bg-white/70" />
                </div>
                <div className="p-4">
                  <div className="text-xs opacity-70">Design your own!</div>
                  <div className="mt-1 font-bold">{PRODUCT_BY_SLUG[s]?.name ?? s}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
