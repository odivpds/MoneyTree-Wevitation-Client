import React from 'react';
import { TemplateProps } from '@/types/template';

export default function AgungTemplate({ data, photo, timeLeft }: TemplateProps) {
  const formattedDate = data.weddingDate 
    ? new Date(data.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tanggal Pernikahan';

  return (
    <div className="invitation-preview" id="invitationPreview">
      <div className="invitation-preview__header">
        <div className="invitation-preview__ornament-top">🕉️</div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--accent-gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 'var(--space-2)', marginTop: 'var(--space-8)' }}>
          {data.greeting}
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          The Wedding Celebration of
        </p>

        <div className="invitation-preview__photo">
          {!photo ? (
            <div className="invitation-preview__photo-placeholder">📷</div>
          ) : (
            <img src={photo} alt="Foto Pasangan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        <h2 className="invitation-preview__names" style={{ fontFamily: data.fontFamily }}>
          <span>{data.groomName || 'Nama Pria'}</span>
          <span style={{ fontSize: '0.6em', display: 'block', margin: '-5px 0' }}>&</span>
          <span>{data.brideName || 'Nama Wanita'}</span>
        </h2>

        <p className="invitation-preview__date">{formattedDate}</p>
        <p className="invitation-preview__venue">{data.mainVenue || 'Lokasi Acara'}</p>
      </div>

      <div className="invitation-preview__body">
        <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-4) 0' }}>
          <img src="/images/ornaments/divider.png" alt="" />
        </div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Menghitung Hari</p>
        <div className="invitation-preview__countdown">
          <div className="countdown-item"><span className="countdown-item__value">{timeLeft.days}</span><span className="countdown-item__label">Hari</span></div>
          <div className="countdown-item"><span className="countdown-item__value">{timeLeft.hours}</span><span className="countdown-item__label">Jam</span></div>
          <div className="countdown-item"><span className="countdown-item__value">{timeLeft.minutes}</span><span className="countdown-item__label">Menit</span></div>
          <div className="countdown-item"><span className="countdown-item__value">{timeLeft.seconds}</span><span className="countdown-item__label">Detik</span></div>
        </div>

        <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-6) 0' }}>
          <img src="/images/ornaments/divider.png" alt="" />
        </div>

        <div style={{ textAlign: 'left', padding: '0 var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>Akad / Pawiwahan</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.akadTime || '09:00 WITA - Selesai'}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{data.akadVenue || 'Pura Keluarga'}</p>
          </div>
          <div style={{ padding: 'var(--space-4)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>Resepsi</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.resepsiTime || '18:00 WITA - Selesai'}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{data.resepsiVenue || 'Nama Venue'}</p>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <button className="btn btn--primary" style={{ width: '80%' }}>Konfirmasi Kehadiran</button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontFamily: 'var(--font-script)', fontSize: 'var(--text-xl)', color: 'var(--accent-gold)' }}>Merupakan suatu kehormatan bagi kami</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>apabila Bapak/Ibu/Saudara/i berkenan hadir</p>
      </div>

      <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '80px', height: '80px', opacity: 0.4, pointerEvents: 'none', transform: 'scaleY(-1)' }} />
      <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '80px', height: '80px', opacity: 0.4, pointerEvents: 'none', transform: 'scale(-1, -1)' }} />
    </div>
  );
}
