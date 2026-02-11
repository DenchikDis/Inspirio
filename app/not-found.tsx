import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-600">Страница не найдена</p>
      <Link
        href="/"
        className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium"
      >
        На главную
      </Link>
    </main>
  );
}
