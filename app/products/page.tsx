import Link from "next/link";

const PRODUCTS = [
  { slug: "t-shirt", name: "T-Shirt", price: 25 },
  { slug: "hoodie", name: "Sweatshirt", price: 30 },
  { slug: "mug", name: "Mug", price: 15 },
  { slug: "notebook", name: "Notebook", price: 10 },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black">PRODUCTS</h1>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="block rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-neutral-600 transition"
            >
              <div className="h-40 bg-lime-400 flex items-center justify-center">
                <div className="w-20 h-20 rounded-lg bg-white/70" />
              </div>
              <div className="p-4">
                <div className="text-xs opacity-70">Design your own!</div>
                <div className="mt-1 font-bold">{p.name}</div>
                <div className="mt-1 text-sm opacity-80">{p.price} USD</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
