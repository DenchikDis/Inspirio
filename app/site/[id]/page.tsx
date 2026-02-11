import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/sites";
import { DetailContent } from "@/components/DetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const site = await getSiteById(id);
  if (!site) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← На главную
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <DetailContent site={site} />
      </div>
    </main>
  );
}
