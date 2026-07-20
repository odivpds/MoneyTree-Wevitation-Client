"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    // Simulate API call for Registration
    // In this mock, we just immediately log them in
    login(email);
    
    // Redirect to templates page after successful mock registration
    router.push("/templates");
  };

  return (
    <div className="login-container bali-pattern-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 'var(--text-4xl)' }}>Daftar Akun</h1>
          <p style={{ color: 'var(--text-muted)' }}>Mulai buat undangan pernikahan eksklusif Anda.</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-group__label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-group__input" 
              placeholder="Nama Anda" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-group__label">Email</label>
            <input 
              type="email" 
              className="form-group__input" 
              placeholder="nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-group__label">Password</label>
            <input 
              type="password" 
              className="form-group__input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            Daftar Sekarang
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-muted)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--accent-gold)' }}>Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
