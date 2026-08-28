"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

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
            {isLoggedIn ? (
              <>
                <span style={{ color: 'var(--text-primary)', marginRight: 'var(--space-2)' }}>Halo, <strong>{user?.name}</strong></span>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn btn--secondary btn--sm">Keluar</button>
              </>
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
  );
}

