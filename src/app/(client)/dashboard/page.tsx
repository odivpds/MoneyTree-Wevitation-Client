"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faEye, faTrash, faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

interface InvitationDraft {
  id: string; // The draftId
  templateId: string;
  templateName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  mainVenue: string;
  updatedAt: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isInitialized } = useAuth();
  const [drafts, setDrafts] = useState<InvitationDraft[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Redirect if not logged in
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    }
  }, [isInitialized, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const masterKey = `undanganBali_user_drafts_${user.email}`;
      const masterData = localStorage.getItem(masterKey);
      
      if (masterData) {
        try {
          const rawDrafts = JSON.parse(masterData);
          const loadedDrafts = rawDrafts.map((d: any) => {
            const template = TEMPLATES.find(t => t.id === d.templateId);
            return {
              id: d.draftId,
              templateId: d.templateId,
              templateName: template ? template.name : d.templateId,
              groomName: d.groomName || 'Pria',
              brideName: d.brideName || 'Wanita',
              weddingDate: d.weddingDate || 'Belum diatur',
              mainVenue: d.mainVenue || 'Belum diatur',
              updatedAt: d.updatedAt || Date.now()
            };
          });

          loadedDrafts.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
          setDrafts(loadedDrafts);
        } catch (error) {
          console.error("Error parsing master drafts from localStorage", error);
        }
      }
    }
  }, [isLoggedIn, user]);

  const handleDelete = (draftId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus undangan ini?")) {
      const userKey = user?.email ? `${user.email}_` : '';
      localStorage.removeItem(`undanganBali_data_${userKey}${draftId}`);
      localStorage.removeItem(`undanganBali_photo_${userKey}${draftId}`);
      localStorage.removeItem(`undanganBali_overrides_${userKey}${draftId}`);

      if (user?.email) {
        const masterKey = `undanganBali_user_drafts_${user.email}`;
        const masterData = localStorage.getItem(masterKey);
        if (masterData) {
          const rawDrafts = JSON.parse(masterData);
          const newDrafts = rawDrafts.filter((d: any) => d.draftId !== draftId);
          localStorage.setItem(masterKey, JSON.stringify(newDrafts));
        }
      }

      setDrafts(drafts.filter(d => d.id !== draftId));
    }
  };

  if (!isClient || !isInitialized || !isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="loader"></div>
          <p style={{ fontWeight: 500 }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section bali-pattern-bg bali-corners" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <span className="section-label">Draft Template</span>
          <h1 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>Halo, {user?.name}</h1>
          <p className="section-subtitle">Kelola draf undangan pernikahan digital Anda di sini.</p>
        </div>

        {/* Toolbar Section */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', 
          borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 'var(--space-4)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.5rem', margin: 0 }}>
            Draft Anda ({drafts.length})
          </h2>
          <Link href="/templates" className="btn btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Buat Undangan Baru</span>
          </Link>
        </div>

        {/* Grid Section */}
        {drafts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(182, 157, 116, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
              <FontAwesomeIcon icon={faCalendar} style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
              Belum Ada Draft
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', maxWidth: '400px', margin: '0 auto var(--space-6)' }}>
              Anda belum membuat draf undangan apa pun. Mulai buat draf pertama Anda sekarang!
            </p>
            <Link href="/templates" className="btn btn--secondary">
              Lihat Koleksi Template
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Draft Cards */}
            {drafts.map((draft) => (
              <div key={draft.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                
                {/* Card Header (Template Tag) */}
                <div style={{ background: 'rgba(182, 157, 116, 0.08)', padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'flex-end' }}>
                   <span style={{ 
                      color: 'var(--accent-gold)', fontSize: '0.75rem', 
                      fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase'
                    }}>
                      Template: {draft.templateName}
                    </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: 'var(--space-5)', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
                    {draft.groomName} & {draft.brideName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <FontAwesomeIcon icon={faCalendar} style={{ color: 'var(--accent-gold)', marginTop: '3px', width: '14px' }} />
                      <span>{draft.weddingDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'var(--accent-gold)', marginTop: '3px', width: '14px' }} />
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{draft.mainVenue}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions) */}
                <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border-color)', background: 'var(--surface-subtle)', gap: '10px' }}>
                  <Link href={`/setup?template=${draft.templateId}&draftId=${draft.id}`} className="btn btn--primary btn--sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faPen} /> <span>Edit</span>
                  </Link>
                  <Link href={`/result?template=${draft.templateId}&draftId=${draft.id}`} className="btn btn--secondary btn--sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faEye} /> <span>Preview</span>
                  </Link>
                  <button onClick={() => handleDelete(draft.id)} style={{ 
                    background: 'transparent', border: 'none', color: 'var(--error)', 
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'opacity 0.2s', padding: 0
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  title="Hapus Draft">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
