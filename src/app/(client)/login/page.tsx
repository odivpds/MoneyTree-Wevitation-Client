"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      // Success
      login(data.user);
      
      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get('next') || "/templates";
      router.push(nextUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container bali-pattern-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 'var(--text-4xl)' }}>Selamat Datang</h1>
          <p style={{ color: 'var(--text-muted)' }}>Silakan login untuk mulai membuat undangan.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
          <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-muted)' }}>
          Belum punya akun? <Link href="/register" style={{ color: 'var(--accent-gold)' }}>Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
