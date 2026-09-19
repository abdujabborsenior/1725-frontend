import { notFound } from 'next/navigation';

/**
 * Noma'lum yo'l (`/ru/mavjud-emas`) — tilga mos 404 layout ichida chiqsin
 * (aks holda Next global 404'ga tushib, navbar va til yo'qolardi).
 */
export default function CatchAllPage() {
  notFound();
}
