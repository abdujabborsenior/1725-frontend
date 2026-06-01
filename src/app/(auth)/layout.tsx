export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-soft relative overflow-hidden">
      {/* Soft brand accents */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-accent-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-brand-100/60 blur-3xl pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(10,25,47,1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,25,47,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
