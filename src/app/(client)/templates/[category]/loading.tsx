import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <section className="section" style={{ paddingTop: '160px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: 'var(--primary)', marginBottom: 'var(--space-4)' }} />
      <p style={{ color: 'var(--text-muted)' }}>Memuat koleksi desain...</p>
    </section>
  );
}
