import RoastForm from "./components/RoastForm";
import RoastCard from "./components/RoastCard";
import Link from "next/link" 

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg bg-orange-100 flex items-center
                      justify-center text-sm"
            >
              🔥
            </div>
            <span className="font-medium text-gray-900">Roast My Work</span>
          </div>
          <Link
            href="/feed"
            className="text-sm text-orange-500 hover:underline"
          >
            Xem feed 🔥
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          AI sẽ thiêu rụi work của bạn
        </h1>
        <p className="text-gray-500 text-sm">
          Paste design, code, bài viết vào đây. Nhận feedback hài hước nhưng có
          ích.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-xl mx-auto px-4 pb-10">
        <RoastForm />
      </section>
    </main>
  );
}
