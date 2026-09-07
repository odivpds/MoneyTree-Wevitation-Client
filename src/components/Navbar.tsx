"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/editor') return null;

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container navbar__inner">
          <Link href="/" className="navbar__logo">Undangan Bali</Link>

          <ul className={`navbar__menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
            <li><Link href="/#beranda" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Beranda</Link></li>
            <li><Link href="/#fitur" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Fitur</Link></li>
            <li><Link href="/#desain" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Desain</Link></li>
            <li><Link href="/#cara-kerja" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Cara Kerja</Link></li>
            <li><Link href="/#harga" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Harga</Link></li>
            <li><Link href="/#testimoni" className="navbar__link" onClick={() => setIsMenuOpen(false)}>Testimoni</Link></li>
            <div className="navbar__actions">
              {!isLoggedIn && (
                <button
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
                  title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                >
                  <span className="theme-toggle__icon">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </span>
                </button>
              )}
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                  <Link href="/dashboard" className="btn btn--primary btn--sm" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-gold)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: 600 }}>Draft Template</span>
                  </Link>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', fontSize: '1rem' }}
                  >
                    <span>Halo, <strong>{user?.name}</strong></span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '0.75rem',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                      padding: '0.5rem', minWidth: '160px', zIndex: 100
                    }}>
                      <button
                        onClick={() => {
                          toggleTheme();
                          setIsUserDropdownOpen(false);
                        }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-primary)', borderRadius: '4px',
                          fontSize: '0.9rem', fontWeight: 500, fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-subtle)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                      </button>
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setShowLogoutModal(true);
                        }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#e63946', borderRadius: '4px',
                          fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-subtle)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Keluar Akun
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn btn--secondary btn--sm" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
                  <Link href="/register" className="btn btn--primary btn--sm" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
                </>
              )}
            </div>
          </ul>

          <div className={`navbar__toggle ${isMenuOpen ? 'active' : ''}`} id="navToggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            padding: '2.5rem', borderRadius: 'var(--radius-lg)',
            width: '90%', maxWidth: '400px',
            boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)',
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease-out forwards'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.75rem' }}>Konfirmasi Keluar</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk kembali untuk mengelola undangan Anda.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn btn--outline"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                  setIsMenuOpen(false);

                  if (pathname.startsWith('/setup') || pathname.startsWith('/result')) {
                    router.push('/');
                  }
                }}
                className="btn btn--primary"
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#e63946', borderColor: '#e63946' }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

