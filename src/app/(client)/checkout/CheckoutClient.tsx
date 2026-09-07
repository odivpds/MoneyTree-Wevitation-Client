"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TemplateConfig } from "@/config/templates";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faClock, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface CheckoutClientProps {
  templateId: string;
  draftId: string | null;
  initialTemplate: TemplateConfig | null;
}

export default function CheckoutClient({ templateId, draftId, initialTemplate }: CheckoutClientProps) {
  const router = useRouter();
  const { user, isLoggedIn, isInitialized } = useAuth();
  
  const [groomName, setGroomName] = useState("Pria");
  const [brideName, setBrideName] = useState("Wanita");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [uniqueCode, setUniqueCode] = useState(0);

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    }
  }, [isInitialized, isLoggedIn, router]);

  useEffect(() => {
    // Generate unique code once on mount (e.g. 111-999)
    setUniqueCode(Math.floor(Math.random() * (999 - 111 + 1)) + 111);
    
    // Load names from draft
    try {
      const userKey = user?.email ? `${user.email}_` : '';
      const templateKey = draftId || templateId || 'default';
      const dataKey = `undanganBali_data_${userKey}${templateKey}`;
      
      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.groomName) setGroomName(parsed.groomName);
        if (parsed.brideName) setBrideName(parsed.brideName);
      }
    } catch (e) {
      console.error(e);
    }
  }, [draftId, templateId, user]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePaid = () => {
    const basePrice = 149000;
    const total = basePrice + uniqueCode;
    const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total);
    
    // Default admin number (user can change this)
    const adminPhone = "6281234567890"; 
    
    const message = `Halo Admin UndanganBali, saya sudah melakukan pembayaran untuk:\n- Nama: ${groomName} & ${brideName}\n- Template: ${initialTemplate?.name || templateId}\n- Total Transfer: ${formattedTotal}\n- ID Pesanan: ${draftId || 'Baru'}\n\nBerikut saya lampirkan bukti transfernya.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
  };

  const basePrice = 149000;
  const total = basePrice + uniqueCode;

  if (!isInitialized || !isLoggedIn) {
    return <div className="min-h-screen pt-24 text-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E6DFD1]">
        
        {/* Header */}
        <div className="bg-[#677359] p-6 text-center text-white">
          <h1 className="font-serif text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
          <p className="text-sm opacity-90">Satu langkah lagi untuk mempublikasikan undangan Anda.</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Order Details */}
          <div className="bg-[#faf7f2] rounded-2xl p-5 border border-[#E6DFD1]">
            <h2 className="font-bold text-[#222] mb-3 border-b border-[#E6DFD1] pb-2">Detail Pesanan</h2>
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>Mempelai</span>
              <span className="font-medium text-[#222]">{groomName} & {brideName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>Template</span>
              <span className="font-medium text-[#222]">{initialTemplate?.name || templateId}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Order ID</span>
              <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded text-[#222]">{draftId?.substring(0, 8) || 'Baru'}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
            <div className="text-3xl font-bold text-[#222] mb-1">
              Rp {new Intl.NumberFormat('id-ID').format(total)}
            </div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>Transfer sesuai nominal hingga 3 digit terakhir</span>
            </div>
          </div>

          {/* QRIS / Rekening Section */}
          <div className="border-2 border-dashed border-[#D4C4B7] rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="w-48 h-48 bg-gray-100 rounded-xl mb-4 flex flex-col items-center justify-center text-gray-400 border border-gray-200 shadow-sm relative overflow-hidden">
              {/* NOTE: You can replace this placeholder with an actual QRIS image later */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-2">
                 <FontAwesomeIcon icon={faQrcode} className="text-6xl text-gray-300 mb-2" />
                 <span className="text-xs font-bold text-gray-400">QRIS PLACEHOLDER</span>
              </div>
            </div>
            <p className="text-sm font-medium text-[#222]">Scan QRIS di atas</p>
            <p className="text-xs text-gray-500 text-center mt-1">atau transfer ke BCA <strong>1234567890</strong><br/>a.n UndanganBali</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center space-x-2 text-red-500 font-medium">
            <FontAwesomeIcon icon={faClock} />
            <span>Bayar sebelum: {formatTime(timeLeft)}</span>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <button 
              onClick={handlePaid}
              className="w-full bg-[#677359] text-white py-3.5 rounded-full font-bold shadow-lg shadow-[#677359]/30 hover:bg-[#58634c] transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Saya Sudah Bayar</span>
            </button>
            <p className="text-xs text-center text-gray-500">
              Dengan mengklik tombol di atas, Anda akan diarahkan ke WhatsApp Admin untuk mengirim bukti transfer.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
