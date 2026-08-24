import Link from "next/link";
import { ArrowRight, ChevronDown, ArrowUpRight, Play, Star, Plus } from "lucide-react";

export default function SerenityTheme() {
  return (
    <main className="w-full overflow-x-hidden font-sans text-[#4A4A45]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-[#D4C4B7] flex items-center justify-center">
            <span className="text-[#D4C4B7] font-serif italic text-lg">S</span>
          </div>
          <span className="font-serif text-2xl text-[#333]">Serenity</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#" className="text-[#333]">Home</Link>
          <Link href="#" className="text-gray-500 hover:text-[#333]">About Us</Link>
          <Link href="#" className="text-gray-500 hover:text-[#333]">Service</Link>
          <Link href="#" className="text-gray-500 hover:text-[#333] flex items-center gap-1">Pages <ChevronDown size={14} /></Link>
        </div>
        <button className="bg-[#D4C4B7] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#c4b3a4] transition">
          Contact Us
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-8 max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 space-y-6">
          <h1 className="font-serif text-5xl md:text-6xl leading-tight text-[#222]">
            Moments Are Framed with Love Grace
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </p>
          <button className="bg-[#677359] text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#58634c] transition">
            Plan With Serenity <ArrowRight size={16} />
          </button>
          
          <div className="pt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#F9F7F2] object-cover" alt="User" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#F9F7F2] object-cover" alt="User" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#F9F7F2] object-cover" alt="User" />
              <div className="w-10 h-10 rounded-full border-2 border-[#F9F7F2] bg-[#D4C4B7] flex items-center justify-center text-white text-xs">
                <Plus size={14} />
              </div>
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#333]">More Than 16K+</span><br/>
              <span className="text-gray-500">Join Us</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-center relative">
          <div className="w-[300px] h-[450px] rounded-[150px] overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" alt="Wedding Couple" className="w-full h-full object-cover" />
          </div>
          {/* Badge */}
          <div className="absolute -bottom-6 right-8 w-24 h-24 rounded-full bg-[#D4C4B7] text-white flex items-center justify-center text-[10px] uppercase text-center p-2 border-4 border-[#F9F7F2] rotate-12">
            Wedding With Serenity Special Day
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 lg:pl-8">
          <div>
            <h3 className="font-serif text-xl mb-2 text-[#222]">Short Gallery :</h3>
            <p className="text-xs text-gray-500 mb-4">Lorem ipsum dolor sit amet, consectetur elit</p>
            <div className="flex gap-4">
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop" className="w-24 h-24 rounded-xl object-cover" alt="Gallery 1" />
              <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop" className="w-24 h-24 rounded-xl object-cover" alt="Gallery 2" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-1 text-[#D4C4B7] mb-2">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <span className="text-[#333] font-bold text-sm ml-2">(4.6/5)</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {['#Bridal Planning', '#Dekor', '#Styling', '#Venue', '#Dream Planning', '#Photography'].map(tag => (
                <span key={tag} className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Banner & Gallery */}
      <section className="max-w-7xl mx-auto px-8 mt-24">
        <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <h2 className="font-serif text-3xl md:text-4xl text-[#222] max-w-xs">Because Every Moment Matters</h2>
          <p className="text-sm text-gray-500 max-w-sm mt-4 md:mt-0 text-center md:text-left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
          </p>
          <div className="mt-6 md:mt-0 text-center md:text-right">
            <h3 className="text-5xl font-serif text-[#333]">6.8<span className="text-[#D4C4B7]">+</span></h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Years Of Experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="h-64 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gallery" />
          </div>
          <div className="h-64 rounded-2xl overflow-hidden mt-8">
            <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gallery" />
          </div>
          <div className="h-64 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1606490225139-b3a1a5116773?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gallery" />
          </div>
        </div>
      </section>

      {/* About Serenity */}
      <section className="max-w-7xl mx-auto px-8 mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div></div>
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-bold text-[#333]">01.</span>
            <div className="h-px bg-gray-300 flex-grow"></div>
            <span className="text-sm text-gray-500 uppercase tracking-wider">About Serenity</span>
          </div>
          <h2 className="font-serif text-4xl text-[#222] mb-6">A Journey Of Love</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <button className="bg-[#677359] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#58634c] transition flex items-center gap-2 w-fit">
            Learn More <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-7xl mx-auto px-8 mt-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <h2 className="font-serif text-5xl text-[#222]">Our Signature Touch</h2>
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-bold text-[#333]">02.</span>
              <div className="h-px bg-gray-300 flex-grow"></div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">What We Do</span>
            </div>
            <p className="text-xs text-gray-500 text-right">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: "01.", title: "Day Coordination" },
            { num: "02.", title: "Wedding Planning" },
            { num: "03.", title: "Intimate Wedding" },
            { num: "04.", title: "Wedding Dress" },
          ].map((service, i) => (
            <div key={i} className="bg-[#F0EBE1] p-8 rounded-3xl aspect-square flex flex-col justify-between group hover:bg-[#e6dfd1] transition cursor-pointer">
              <span className="font-serif text-2xl text-[#333]">{service.num}</span>
              <div>
                <h3 className="font-serif text-xl mb-3 text-[#222]">{service.title}</h3>
                <p className="text-xs text-gray-500 mb-6">Lorem ipsum dolor sit amet, consectetur elit sit amet.</p>
                <div className="w-8 h-8 rounded-full bg-[#D4C4B7] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:translate-x-1 transition transform">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="w-full bg-[#677359] text-white mt-32 py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
          <div>
            <h3 className="text-5xl font-serif mb-2">86<span className="text-[#D4C4B7]">+</span></h3>
            <p className="text-xs uppercase tracking-widest text-white/70">Curated Weddings</p>
          </div>
          <div>
            <h3 className="text-5xl font-serif mb-2">120K<span className="text-[#D4C4B7]">+</span></h3>
            <p className="text-xs uppercase tracking-widest text-white/70">Happy Customers</p>
          </div>
          <div>
            <h3 className="text-5xl font-serif mb-2">14K<span className="text-[#D4C4B7]">+</span></h3>
            <p className="text-xs uppercase tracking-widest text-white/70">Venue Partners</p>
          </div>
          <div>
            <h3 className="text-5xl font-serif mb-2">6.8<span className="text-[#D4C4B7]">+</span></h3>
            <p className="text-xs uppercase tracking-widest text-white/70">Years Of Experience</p>
          </div>
        </div>
      </section>

      {/* Essence of Serenity */}
      <section className="max-w-7xl mx-auto px-8 mt-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5 relative">
            <div className="bg-[#F0EBE1] rounded-[40px] p-12 h-full flex flex-col justify-center">
              <h2 className="font-serif text-5xl text-[#222] mb-6">Essence of Serenity</h2>
              <p className="text-sm text-gray-500 mb-12 max-w-sm">
                Lorem ipsum dolor sit amet, consectetur elit adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
              </p>
              <div className="w-24 h-24 opacity-20">
                {/* Decorative flower SVG placeholder */}
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M50 50 C 20 20, 20 80, 50 50 C 80 80, 80 20, 50 50 M50 20 L50 80 M20 50 L80 50" />
                </svg>
              </div>
            </div>
            {/* Overlapping oval image */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-24 w-64 h-[400px] rounded-[100px] overflow-hidden border-8 border-[#F9F7F2] hidden lg:block z-10">
              <img src="https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Couple" />
            </div>
          </div>
          <div className="md:col-span-2"></div>
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-[#333]">03.</span>
              <div className="h-px bg-gray-300 flex-grow"></div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Why Choose Us</span>
            </div>
            <p className="text-xl font-serif text-[#333] mb-8 max-w-sm">
              We don't just plan weddings, we craft unforgettable moments.
            </p>
            <div className="h-64 rounded-3xl overflow-hidden w-full max-w-md">
              <img src="https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Landscape" />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="max-w-7xl mx-auto px-8 mt-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <h2 className="font-serif text-5xl text-[#222]">Timeless Of Memoris</h2>
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-bold text-[#333]">04.</span>
              <div className="h-px bg-gray-300 flex-grow"></div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Portfolio</span>
            </div>
            <p className="text-xs text-gray-500 text-right">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {[
            { names: "Alicia & Martin", tags: ["Wedding Planning", "Photography"], img1: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop", img2: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop" },
            { names: "David & Roses", tags: ["Intimate Wedding", "Photography"], img1: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop", img2: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop" },
            { names: "Marry & James", tags: ["Venue", "Flower Planning", "Photography"], img1: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=400&auto=format&fit=crop", img2: "https://images.unsplash.com/photo-1606490225139-b3a1a5116773?q=80&w=400&auto=format&fit=crop" },
          ].map((item, i) => (
            <div key={i} className="bg-[#F0EBE1] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between group hover:bg-[#e6dfd1] transition">
              <div className="flex flex-col gap-4 w-full md:w-1/3 mb-6 md:mb-0">
                <div className="flex text-[#D4C4B7]">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <h3 className="font-serif text-2xl text-[#222]">{item.names}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-3 py-1 bg-white/50 rounded-full text-gray-600 border border-white">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <img src={item.img1} className="w-32 h-24 rounded-xl object-cover" alt="Portfolio" />
                <img src={item.img2} className="w-32 h-24 rounded-xl object-cover hidden sm:block" alt="Portfolio" />
              </div>
              
              <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-end">
                <button className="bg-[#677359] text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#58634c] transition">
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Video */}
      <section className="max-w-7xl mx-auto px-8 mt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-[#333]">05.</span>
              <div className="h-px bg-gray-300 flex-grow"></div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">FAQs</span>
            </div>
            <h2 className="font-serif text-4xl text-[#222] mb-12">You Asked, We Answered</h2>
            
            <div className="space-y-4">
              {[
                "What is the first step in booking a wedding with Serenity?",
                "Do you offer customizable wedding packages?",
                "How far in advance should we book your services?",
              ].map((q, i) => (
                <div key={i} className="border-b border-gray-300 pb-4">
                  <div className="flex justify-between items-center cursor-pointer">
                    <h4 className={`text-sm font-medium ${i===0 ? "text-[#333]" : "text-gray-500"}`}>{q}</h4>
                    <ChevronDown size={16} className={i===0 ? "text-[#333]" : "text-gray-400"} />
                  </div>
                  {i === 0 && (
                    <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Video cover" />
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl max-w-sm">
                <h3 className="font-serif text-2xl text-[#222] mb-4">Thoughtful Planning for a Seamless Day</h3>
                <button className="bg-[#677359] text-white px-6 py-2 rounded-full text-xs font-medium flex items-center gap-2 mx-auto hover:bg-[#58634c] transition">
                  Watch Video <Play size={12} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact CTA */}
      <footer className="mt-32 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#D4C4B7] flex items-center justify-center">
              <span className="text-[#D4C4B7] font-serif italic text-lg">S</span>
            </div>
            <span className="font-serif text-2xl text-[#333]">Serenity</span>
          </div>
          
          <div className="text-center">
            <h3 className="font-serif text-2xl text-[#222] mb-4">Let's Plan Your Dream<br/>Wedding With Serenity!</h3>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 py-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 Serenity. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
