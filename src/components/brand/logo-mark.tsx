/**
 * MYMarkaz brand belgisi — 8 segmentli "markaz" gulchambari.
 * Ma'nosi: markaziy nuqta (g'oya/markaz) atrofida yig'ilgan 8 yo'nalish
 * (hamjamiyat). Mustaqil inline SVG — tashqi faylga bog'liq emas.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g strokeWidth={6} strokeLinejoin="round">
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" fill="#74ABD8" stroke="#74ABD8" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(45 50 50)" fill="#578EBE" stroke="#578EBE" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(90 50 50)" fill="#3D6F9E" stroke="#3D6F9E" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(135 50 50)" fill="#2A527E" stroke="#2A527E" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(180 50 50)" fill="#1C3B60" stroke="#1C3B60" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(225 50 50)" fill="#2A527E" stroke="#2A527E" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(270 50 50)" fill="#3D6F9E" stroke="#3D6F9E" />
      <path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z" transform="rotate(315 50 50)" fill="#578EBE" stroke="#578EBE" />
      </g>
      <circle cx="50" cy="50" r="11" fill="#0A192F" />
    </svg>
  );
}
