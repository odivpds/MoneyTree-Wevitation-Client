"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";
import styles from "./page.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faEye, faTrash, faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

interface InvitationDraft {
  id: string; // The storage key
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
      // Load drafts from localStorage
      const loadedDrafts: InvitationDraft[] = [];
      const prefix = `draft_${user.email}_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          try {
            const templateId = key.replace(prefix, "");
            const template = TEMPLATES.find(t => t.id === templateId);
            const dataStr = localStorage.getItem(key);

            if (dataStr) {
              const data = JSON.parse(dataStr);
              loadedDrafts.push({
                id: key,
                templateId,
                templateName: template ? template.name : templateId,
                groomName: data.groomName || 'Pria',
                brideName: data.brideName || 'Wanita',
                weddingDate: data.weddingDate || 'Belum diatur',
                mainVenue: data.mainVenue || 'Belum diatur',
                updatedAt: data.updatedAt || Date.now() // Optional if not saved previously
              });
            }
          } catch (error) {
            console.error("Error parsing draft from localStorage", error);
          }
        }
      }

      // Sort by newest if we had reliable timestamps, for now just sort by templateId
      loadedDrafts.sort((a, b) => a.templateName.localeCompare(b.templateName));
      setDrafts(loadedDrafts);
    }
  }, [isLoggedIn, user]);

  const handleDelete = (key: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus undangan ini?")) {
      localStorage.removeItem(key);
      setDrafts(drafts.filter(d => d.id !== key));
    }
  };

  if (!isClient || !isInitialized || !isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.dashboardSection}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.welcomeTitle}>Halo, {user?.name}</h1>
          <p className={styles.welcomeText}>Kelola undangan pernikahan digital Anda di sini.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Create New Card */}
        <Link href="/templates" className={styles.createCard}>
          <FontAwesomeIcon icon={faPlus} className={styles.createIcon} />
          <h3>Buat Undangan Baru</h3>
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>Pilih dari koleksi template eksklusif kami</p>
        </Link>

        {/* Draft Cards */}
        {drafts.map((draft) => (
          <div key={draft.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{draft.groomName} & {draft.brideName}</h3>
              <span className={styles.cardBadge}>{draft.templateName}</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardDetail}>
                <FontAwesomeIcon icon={faCalendar} style={{ opacity: 0.7, width: '16px' }} />
                <span>{draft.weddingDate}</span>
              </div>
              <div className={styles.cardDetail}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ opacity: 0.7, width: '16px' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {draft.mainVenue}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Link href={`/setup?template=${draft.templateId}`} className={`${styles.btnAction} ${styles.btnPrimary}`}>
                <FontAwesomeIcon icon={faPen} /> Edit
              </Link>
              <Link href={`/preview?template=${draft.templateId}`} className={`${styles.btnAction} ${styles.btnSecondary}`}>
                <FontAwesomeIcon icon={faEye} /> Preview
              </Link>
              <button onClick={() => handleDelete(draft.id)} className={`${styles.btnAction} ${styles.btnDanger}`} title="Hapus">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
