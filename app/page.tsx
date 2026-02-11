import Link from "next/link";
import { getSites } from "@/lib/sites";
import { SiteCard } from "@/components/SiteCard";

export default async function Home() {
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let error: string | null = null;
  try {
    sites = await getSites();
  } catch (e) {
    error = e instanceof Error ? e.message : "Не удалось загрузить сайты";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Inspirio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Инспирационная доска сайтов
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Админ-панель →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
            {error}
          </div>
        )}

        {!error && sites.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Пока нет добавленных сайтов.</p>
            <Link
              href="/admin"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Добавить первый сайт
            </Link>
          </div>
        )}

        {!error && sites.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <li key={site.id}>
                <SiteCard site={site} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
