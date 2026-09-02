/**
 * Yechim AI Studio qobig'i.
 *
 * ATAYLAB sayt "chrome"isiz (navbar, footer, tab bar YO'Q): AI — sahifa
 * emas, alohida ekran. Saytga qaytish yo'li Studio'ning o'z yuqori
 * panelida turadi.
 *
 * Balandlik `100dvh` va sahifa O'ZI scroll bo'lmaydi (mobil brauzer
 * paneli hisobga olinadi) → kirish maydoni doim ekran pastida, uning
 * ostida ortiqcha bo'sh joy qolmaydi.
 */
export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="yz flex h-dvh flex-col overflow-hidden">
      {/* Nozik don — sirt "chop etilgan" his beradi (fayl/so'rov emas, CSS) */}
      <span aria-hidden className="yz-grain" />
      {children}
    </div>
  );
}
