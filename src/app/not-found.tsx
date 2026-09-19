import './globals.css';

/**
 * Global 404 — til aniqlanmagan so'rovlar uchun (middleware'dan tashqarida,
 * masalan mavjud bo'lmagan fayl). Til noma'lum — shuning uchun uch tilda.
 */
export default function GlobalNotFound() {
  return (
    <html lang="uz">
      <body className="font-sans">
        <main className="flex min-h-screen items-center justify-center bg-white px-4 text-center">
          <div>
            <p className="text-[4rem] font-semibold leading-none tracking-[-0.03em] text-brand-900">404</p>
            <h1 className="mt-3 text-title-3 font-semibold text-brand-900">
              <span lang="uz">Sahifa topilmadi</span>
              <span aria-hidden className="mx-2 text-slate-400">·</span>
              <span lang="ru">Страница не найдена</span>
              <span aria-hidden className="mx-2 text-slate-400">·</span>
              <span lang="en">Page not found</span>
            </h1>
            <a
              href="/"
              className="mt-8 inline-flex h-[50px] min-w-[180px] items-center justify-center rounded-full bg-accent-600 px-7 text-body font-medium text-white"
            >
              MYMarkaz
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
