export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-brand-600/20 -top-64 -left-64" />
      <div className="orb w-[500px] h-[500px] bg-violet-600/15 -bottom-48 -right-48" />
      <div className="orb w-[300px] h-[300px] bg-neon-green/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
