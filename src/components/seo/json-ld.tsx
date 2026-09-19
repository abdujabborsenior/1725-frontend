/**
 * Structured data (JSON-LD) — Google boy natijalari uchun.
 *
 * ⚠️ XAVFSIZLIK: ma'lumotda foydalanuvchi matni bo'lishi mumkin (startap nomi,
 * muammo matni). `JSON.stringify` `</script>` ni qochirmaydi — shuning uchun
 * `<`, `>`, `&` va U+2028/2029 unicode-escape qilinadi: matn skript tegini
 * yopib, sahifaga HTML/JS kirita olmaydi (stored XSS'ning klassik yo'li).
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return (
    <script
      type="application/ld+json"
      // Yuqoridagi escape tufayli xavfsiz — kontent faqat JSON
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
