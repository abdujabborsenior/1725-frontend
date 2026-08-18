#!/usr/bin/env node
/* eslint-disable */
/**
 * MYMarkaz — iOS icon set generator.
 *
 * Manba: Ionicons 8 (MIT) — Ionic jamoasi tomonidan AYNAN iOS uchun chizilgan
 * to'plam (Apple'ning SF Symbols geometriyasiga eng yaqin ochiq to'plam).
 * SVG'lar build vaqtida React komponentlariga aylantiriladi — runtime bog'liqlik
 * yo'q, har bir ikonka alohida faylda (tree-shaking to'liq ishlaydi).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'node_modules/ionicons/dist/svg');
const OUT = path.join(ROOT, 'src/components/icons');

/** Export nomi → ionicons fayl nomi. */
const MAP = {
  // ── Navigatsiya (iOS chevron/arrow) ───────────────────────────────
  ChevronLeft: 'chevron-back',
  ChevronRight: 'chevron-forward',
  ChevronUp: 'chevron-up',
  ChevronDown: 'chevron-down',
  ArrowLeft: 'arrow-back-outline',
  ArrowRight: 'arrow-forward-outline',
  ArrowUp: 'arrow-up-outline',
  ArrowDown: 'arrow-down-outline',
  ArrowUpCircle: 'arrow-up-circle-outline',
  ArrowUpCircleFill: 'arrow-up-circle',
  ExternalLink: 'open-outline',
  Menu: 'menu-outline',
  Close: 'close-outline',
  X: 'close-outline',
  CloseCircleFill: 'close-circle',
  XCircle: 'close-circle-outline',

  // ── Asosiy tab / bo'limlar ────────────────────────────────────────
  Home: 'home-outline',
  HomeFill: 'home',
  Compass: 'compass-outline',
  CompassFill: 'compass',
  Search: 'search-outline',
  SearchFill: 'search',
  Bell: 'notifications-outline',
  BellFill: 'notifications',
  User: 'person-outline',
  UserFill: 'person',
  UserIcon: 'person-outline',
  UserRound: 'person-outline',
  UserCircle: 'person-circle-outline',
  UserCircleFill: 'person-circle',
  Users: 'people-outline',
  UsersFill: 'people',
  UsersRound: 'people-outline',
  UserPlus: 'person-add-outline',
  UserX: 'person-remove-outline',

  // ── Chat ──────────────────────────────────────────────────────────
  MessageCircle: 'chatbubble-outline',
  MessageCircleFill: 'chatbubble',
  MessageSquare: 'chatbox-outline',
  MessagesSquare: 'chatbubbles-outline',
  MessagesSquareFill: 'chatbubbles',
  MessageDots: 'chatbubble-ellipses-outline',
  MessageSquarePlus: 'create-outline',
  Send: 'send',
  SendOutline: 'send-outline',
  PaperPlane: 'paper-plane-outline',
  Reply: 'arrow-undo-outline',
  CornerDownLeft: 'return-down-back-outline',
  Paperclip: 'attach-outline',
  Mic: 'mic-outline',
  MicFill: 'mic',
  CheckCheck: 'checkmark-done-outline',

  // ── Amallar ───────────────────────────────────────────────────────
  Plus: 'add-outline',
  PlusCircle: 'add-circle-outline',
  PlusCircleFill: 'add-circle',
  Minus: 'remove-outline',
  Check: 'checkmark-outline',
  CheckCircle2: 'checkmark-circle-outline',
  CheckCircleFill: 'checkmark-circle',
  Trash2: 'trash-outline',
  Pencil: 'pencil-outline',
  PencilLine: 'create-outline',
  Copy: 'copy-outline',
  Save: 'download-outline',
  Download: 'download-outline',
  UploadCloud: 'cloud-upload-outline',
  RefreshCw: 'refresh-outline',
  Share2: 'share-outline',
  ShareSocial: 'share-social-outline',
  MoreVertical: 'ellipsis-vertical',
  MoreHorizontal: 'ellipsis-horizontal',
  SlidersHorizontal: 'options-outline',
  Filter: 'funnel-outline',
  Settings: 'settings-outline',
  SettingsFill: 'settings',
  LogOut: 'log-out-outline',
  Ban: 'ban-outline',

  // ── Kontent ───────────────────────────────────────────────────────
  Heart: 'heart-outline',
  HeartFill: 'heart',
  Star: 'star-outline',
  StarFill: 'star',
  StarHalf: 'star-half',
  Bookmark: 'bookmark-outline',
  BookmarkFill: 'bookmark',
  ThumbsUp: 'thumbs-up-outline',
  ThumbsUpFill: 'thumbs-up',
  ThumbsDown: 'thumbs-down-outline',
  ThumbsDownFill: 'thumbs-down',
  // Yechim AI — ovoz yozishni to'xtatish
  StopCircle: 'stop-circle-outline',
  StopCircleFill: 'stop-circle',
  Eye: 'eye-outline',
  EyeOff: 'eye-off-outline',
  Flag: 'flag-outline',
  FlagFill: 'flag',
  Lightbulb: 'bulb-outline',
  LightbulbFill: 'bulb',
  Sparkles: 'sparkles-outline',
  SparklesFill: 'sparkles',
  Flame: 'flame-outline',
  FlameFill: 'flame',
  Rocket: 'rocket-outline',
  RocketFill: 'rocket',
  Trophy: 'trophy-outline',
  TrophyFill: 'trophy',
  Medal: 'medal-outline',
  MedalFill: 'medal',
  Ribbon: 'ribbon-outline',
  Award: 'ribbon-outline',
  Tag: 'pricetag-outline',
  TagFill: 'pricetag',
  Layers: 'layers-outline',
  BookOpen: 'book-outline',
  BookOpenFill: 'book',
  FileText: 'document-text-outline',
  FileTextFill: 'document-text',
  FileQuestion: 'document-text-outline',
  Clock: 'time-outline',
  ClockFill: 'time',
  Calendar: 'calendar-outline',
  CalendarDays: 'calendar-outline',
  MapPin: 'location-outline',
  MapPinFill: 'location',
  Globe: 'globe-outline',
  Earth: 'earth-outline',
  Link2: 'link-outline',
  LinkIcon: 'link-outline',
  Hash: 'CUSTOM',
  Type: 'text-outline',
  Info: 'information-circle-outline',
  InfoFill: 'information-circle',
  HelpCircle: 'help-circle-outline',
  AlertCircle: 'alert-circle-outline',
  AlertCircleFill: 'alert-circle',
  ShieldCheck: 'shield-checkmark-outline',
  ShieldAlert: 'warning-outline',
  Warning: 'warning-outline',
  Lock: 'lock-closed-outline',
  LockOpen: 'lock-open-outline',
  KeyRound: 'key-outline',
  Mail: 'mail-outline',
  MailOpen: 'mail-open-outline',
  AtSign: 'at-outline',
  IdCard: 'card-outline',
  Wallet: 'wallet-outline',
  ShoppingBag: 'bag-handle-outline',
  School: 'school-outline',
  GraduationCap: 'school-outline',
  Briefcase: 'briefcase-outline',
  Storefront: 'storefront-outline',
  Megaphone: 'megaphone-outline',
  Gift: 'gift-outline',
  Sprout: 'leaf-outline',
  Hand: 'hand-left-outline',
  HeartPulse: 'pulse-outline',
  Bot: 'hardware-chip-outline',
  Disc: 'disc-outline',
  Gamepad2: 'game-controller-outline',
  Music: 'musical-note-outline',
  Film: 'film-outline',
  Smartphone: 'phone-portrait-outline',
  Grid: 'grid-outline',
  GridFill: 'grid',
  List: 'list-outline',
  Vote: 'checkbox-outline',
  VoteFill: 'checkbox',
  BarChart3: 'bar-chart-outline',
  StatsChart: 'stats-chart-outline',
  TrendingUp: 'trending-up-outline',
  Analytics: 'analytics-outline',

  // ── Media ─────────────────────────────────────────────────────────
  Camera: 'camera-outline',
  CameraFill: 'camera',
  Image: 'image-outline',
  ImageIcon: 'image-outline',
  Images: 'images-outline',
  Video: 'videocam-outline',
  VideoFill: 'videocam',
  Play: 'play',
  PlayCircle: 'play-circle',
  Pause: 'pause',
  Youtube: 'logo-youtube',
  Zap: 'flash-outline',
  ZapFill: 'flash',
  QrCode: 'qr-code-outline',
  Scan: 'scan-outline',
  Expand: 'expand-outline',
};

/** Ionicons'da yo'q — SF Symbols geometriyasida qo'lda chizilgan (512 grid). */
const CUSTOM = {
  Hash: {
    stroke: 32,
    body: `<path d="M176 96 144 416M368 96l-32 320M96 192h320M80 320h320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  ArrowUpRight: {
    stroke: 32,
    body: `<path d="M176 336 336 176M232 176h104v104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  Crown: {
    stroke: 0,
    body: `<path d="M67 152a29 29 0 0 0-28 36l40 165a26 26 0 0 0 25 20h304a26 26 0 0 0 25-20l40-165a29 29 0 0 0-45-31l-71 51a12 12 0 0 1-17-4l-58-104a24 24 0 0 0-42 0l-58 104a12 12 0 0 1-17 4l-71-51a29 29 0 0 0-17-5zM104 408a20 20 0 0 0 0 40h304a20 20 0 0 0 0-40z"/>`,
  },
  CrownOutline: {
    stroke: 32,
    body: `<path d="M67 152a13 13 0 0 0-13 16l40 165a10 10 0 0 0 10 8h304a10 10 0 0 0 10-8l40-165a13 13 0 0 0-20-14l-71 51a28 28 0 0 1-40-9l-58-104a8 8 0 0 0-14 0l-58 104a28 28 0 0 1-40 9l-71-51a13 13 0 0 0-7-2zM104 424h304" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  UserCheck: {
    stroke: 32,
    body: `<path d="M344 144c-4 71-56 128-120 128S100 215 104 144c4-74 55-128 120-128s124 56 120 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M224 304c-71 0-142 39-165 110-6 20 5 42 25 42h182" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="m328 400 40 40 88-96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  /** iOS activity indicator — 12 ta kichrayuvchi tayoqcha (aylanma spinner). */
  Spinner: { stroke: 0, body: 'SPINNER' },
  Loader2: { stroke: 0, body: 'SPINNER' },
};

/* ── Yordamchilar ─────────────────────────────────────────────────── */
const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const KEEP_KEBAB = new Set(['data-name']);

function attrsToJsx(tag) {
  return tag.replace(/([a-zA-Z-]+)="([^"]*)"/g, (m, name, value) => {
    if (name === 'class' || name === 'xmlns') return '';
    if (name === 'stroke-width') return ''; // svg darajasidan meros oladi
    if (KEEP_KEBAB.has(name)) return m;
    return `${toCamel(name)}="${value}"`;
  });
}

function spinnerBody() {
  const bars = [];
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const opacity = (0.16 + (i / 12) * 0.84).toFixed(2);
    bars.push(
      `<rect x="238" y="46" width="36" height="120" rx="18" opacity="${opacity}" transform="rotate(${angle} 256 256)" />`,
    );
  }
  return bars.join('');
}

function convert(name, file) {
  let body;
  let nativeStroke = 32;

  if (file === 'CUSTOM' || CUSTOM[name]) {
    const c = CUSTOM[name];
    if (!c) throw new Error(`CUSTOM yo'q: ${name}`);
    body = c.body === 'SPINNER' ? spinnerBody() : c.body;
    nativeStroke = c.stroke;
  } else {
    const p = path.join(SRC, `${file}.svg`);
    if (!fs.existsSync(p)) throw new Error(`Ionicon topilmadi: ${file} (${name})`);
    let raw = fs.readFileSync(p, 'utf8');
    // stroke-width qiymatlarini yig'ish
    const widths = [...raw.matchAll(/stroke-width="([\d.]+)(?:px)?"/g)].map((m) => Number(m[1]));
    const uniq = [...new Set(widths)];
    if (uniq.length === 1) nativeStroke = uniq[0];
    else if (uniq.length > 1) nativeStroke = 0; // aralash — path'da qoldiriladi
    raw = raw.replace(/<title>.*?<\/title>/g, '');
    const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    body =
      nativeStroke === 0 && uniq.length > 1
        ? inner.replace(/stroke-width="([\d.]+)(?:px)?"/g, 'strokeWidth="$1"')
        : inner;
    body = body.replace(/<([a-z]+)([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
      if (uniq.length > 1) {
        // aralash holatda strokeWidth allaqachon camelCase — attrsToJsx uni o'chirmasin
        const kept = attrs.match(/strokeWidth="[\d.]+"/);
        const cleaned = attrsToJsx(attrs.replace(/strokeWidth="[\d.]+"/, ''));
        return `<${tag}${cleaned}${kept ? ' ' + kept[0] : ''}${close ? '/' : ''}>`;
      }
      return `<${tag}${attrsToJsx(attrs)}${close ? '/' : ''}>`;
    });
  }

  body = body.replace(/\s+/g, ' ').replace(/\s>/g, '>').trim();
  return { body, nativeStroke };
}

/* ── Generatsiya ──────────────────────────────────────────────────── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const HEADER = `/* AVTO-GENERATSIYA — qo'lda tahrirlanmaydi.
   Manba: Ionicons 8 (MIT) — iOS uchun chizilgan asl to'plam.
   Generator: scripts/gen-icons.js */\n`;

/* Fayl nomi = export nomining AYNAN o'zi. Shu tufayli next.config'dagi
   `modularizeImports` transformi ({{member}}) hech qanday nom-konvertatsiyaga
   tayanmaydi — barrel import to'g'ridan-to'g'ri kerakli faylga aylanadi. */

fs.writeFileSync(
  path.join(OUT, 'base.tsx'),
  `${HEADER}import type { ReactElement, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Chiziq qalinligi — 24-grid o'lchovida (ikonka 512-gridga o'zi o'giradi). */
  strokeWidth?: number | string;
}

/** Ikonka komponenti tipi (props sifatida uzatiladigan ikonkalar uchun). */
export type IconComponent = (props: IconProps) => ReactElement;

const GRID = 512 / 24;

/**
 * Barcha iOS ikonkalari uchun umumiy SVG asos.
 * Ionicons 512-gridda chizilgan; \`strokeWidth\` propi odatiy 24-grid
 * qiymatida beriladi va shu yerda masshtablanadi.
 */
export function IconBase({
  nativeStroke = 32,
  strokeWidth,
  children,
  ...rest
}: IconProps & { nativeStroke?: number }) {
  const sw = strokeWidth === undefined ? nativeStroke : Number(strokeWidth) * GRID;
  return (
    <svg
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      fill="currentColor"
      stroke="none"
      strokeWidth={sw || undefined}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}
`,
);

const entries = Object.entries(MAP);
for (const key of Object.keys(CUSTOM)) if (!MAP[key]) entries.push([key, 'CUSTOM']);

const index = [];
for (const [name, file] of entries) {
  const { body, nativeStroke } = convert(name, file);
  const fileName = name;
  const src = `${HEADER}import { IconBase, type IconProps } from './base';

export function ${name}(props: IconProps) {
  return (
    <IconBase nativeStroke={${nativeStroke}} {...props}>
      ${body}
    </IconBase>
  );
}
`;
  fs.writeFileSync(path.join(OUT, `${fileName}.tsx`), src);
  index.push(`export { ${name} } from './${fileName}';`);
}

fs.writeFileSync(
  path.join(OUT, 'index.ts'),
  `${HEADER}export { IconBase, type IconProps, type IconComponent } from './base';\nexport type { IconProps as LucideProps, IconComponent as LucideIcon } from './base';\n${index.sort().join('\n')}\n`,
);

console.log(`✓ ${entries.length} ta iOS ikonka generatsiya qilindi → ${OUT}`);
