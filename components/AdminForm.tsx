"use client";

import { useState } from "react";
import { addSite } from "@/app/admin/actions";
import type { AddSiteState } from "@/app/admin/actions";

const initialState: AddSiteState = {};

export function AdminForm() {
  const [state, setState] = useState<AddSiteState>(initialState);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setState({});
    try {
      const next = await addSite(state, formData);
      setState(next);
      if (next.success) form.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">Добавить сайт</h2>

      {state?.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700 text-sm">
          Сайт успешно добавлен.
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Название *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Название сайта"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Краткое описание"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL сайта
        </label>
        <input
          id="url"
          name="url"
          type="url"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-1">
          Фреймворк
        </label>
        <input
          id="framework"
          name="framework"
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Next.js, React, …"
        />
      </div>

      <div>
        <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-1">
          Технологии (через запятую)
        </label>
        <input
          id="technologies"
          name="technologies"
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="TypeScript, Tailwind, …"
        />
      </div>

      <div>
        <label htmlFor="fonts" className="block text-sm font-medium text-gray-700 mb-1">
          Шрифты (через запятую)
        </label>
        <input
          id="fonts"
          name="fonts"
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Inter, Roboto, …"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Скриншоты
        </label>
        <input
          name="screenshots"
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Формат: JPG, PNG, WebP, GIF. Максимальный размер загрузки: до 10 МБ (все файлы формы вместе).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Видео (mp4 и др.)
        </label>
        <input
          name="videos"
          type="file"
          accept="video/*"
          multiple
          className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Формат: MP4, WebM. Максимальный размер загрузки: до 10 МБ (все файлы формы вместе).
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Добавление…" : "Добавить сайт"}
      </button>
    </form>
  );
}
