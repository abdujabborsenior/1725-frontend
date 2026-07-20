import type { QueryClient } from '@tanstack/react-query';

/**
 * Like/saqlash/ovoz kabi toggle natijasini React Query keshidagi BARCHA
 * so'rovlarga yozib qo'yish (write-through). Shunda foydalanuvchi boshqa
 * sahifaga o'tib qaytsa yoki o'sha obyekt bir nechta ro'yxatda ko'rinsa,
 * holat hamma joyda bir xil va to'g'ri qoladi (id — UUID, global unikal).
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  const proto: unknown = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function patchNode(
  node: unknown,
  id: string,
  patch: Record<string, unknown>,
): unknown {
  if (Array.isArray(node)) {
    let changed = false;
    const next = node.map((item) => {
      const p = patchNode(item, id, patch);
      if (p !== item) changed = true;
      return p;
    });
    return changed ? next : node;
  }
  if (isPlainObject(node)) {
    let out: Record<string, unknown> | null = null;
    for (const key of Object.keys(node)) {
      const val = node[key];
      const p = patchNode(val, id, patch);
      if (p !== val) {
        if (!out) out = { ...node };
        out[key] = p;
      }
    }
    if (node.id === id) {
      if (!out) out = { ...node };
      Object.assign(out, patch);
    }
    return out ?? node;
  }
  return node;
}

/** Keshdagi `id` mos har bir obyektga `patch` maydonlarini qo'shib yangilaydi. */
export function patchEntityInQueries(
  qc: QueryClient,
  id: string,
  patch: Record<string, unknown>,
): void {
  for (const query of qc.getQueryCache().getAll()) {
    const data = query.state.data;
    if (data === undefined || data === null) continue;
    const next = patchNode(data, id, patch);
    if (next !== data) qc.setQueryData(query.queryKey, next);
  }
}
