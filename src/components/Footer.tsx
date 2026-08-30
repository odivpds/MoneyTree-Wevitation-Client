import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="footer bali-footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link href="/" className="navbar__logo" style={{ fontSize: 'var(--text-4xl)' }}>Undangan Bali</Link>
            <p className="footer__brand-desc">
              Platform undangan pernikahan digital premium bertemakan kebudayaan Bali.
              Wujudkan undangan impian Anda dengan sentuhan tradisi yang elegan.
            </p>
          </div>

          <div>
            <h4 className="footer__heading">Menu</h4>
            <ul className="footer__links">
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/templates">Template</Link></li>
              <li><Link href="/#harga">Harga</Link></li>
              <li><Link href="/#cara-kerja">Cara Kerja</Link></li>
              <li><Link href="/#testimoni">Testimoni</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Layanan</h4>
            <ul className="footer__links">
              <li><Link href="#">Undangan Digital</Link></li>
              <li><Link href="#">Custom Design</Link></li>
              <li><Link href="#">Video Undangan</Link></li>
              <li><Link href="#">RSVP Online</Link></li>
              <li><Link href="#">QR Code</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Kontak</h4>
            <ul className="footer__links">
              <li><Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--accent-gold)" /> Denpasar, Bali</Link></li>
              <li><Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} color="var(--accent-gold)" /> +62 812-3456-7890</Link></li>
              <li><Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} color="var(--accent-gold)" /> hello@undanganbali.com</Link></li>
              <li><Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="var(--accent-gold)" /> 09:00 - 21:00 WITA</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2024 Undangan Bali. All rights reserved.</p>
          <p>
            <Link href="#" style={{ color: 'var(--accent-gold)' }}>Privacy Policy</Link> ·
            <Link href="#" style={{ color: 'var(--accent-gold)' }}>Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
