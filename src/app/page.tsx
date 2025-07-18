'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, ArrowRight, MapPin, Shield, Clock, Users, TrendingUp, FileText, Bell, Database } from 'lucide-react'

// Intersection Observer hook for scroll animations
function useIntersectionObserver<T extends HTMLElement>(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  const ref = useCallback((node: T | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting] as const;
}


type FeatureProps = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
}

// Animated Feature Component
function Feature({ icon: Icon, title, description, delay = 0 }: FeatureProps) {
  const [setRef, isVisible] = useIntersectionObserver();

  return (
    <div 
      ref={setRef}
      className={`group relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 border border-gray-100 hover:border-red-200 transform hover:-translate-y-1 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-all duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-red-600 transition-transform duration-300 group-hover:rotate-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

type BenefitProps = FeatureProps

// Animated Benefits Component
function Benefit({ icon: Icon, title, description, delay = 0 }: BenefitProps) {
  const [setRef, isVisible] = useIntersectionObserver();

  return (
    <div 
      ref={setRef}
      className={`text-center p-6 transform transition-all duration-700 hover:scale-105 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-200 hover:scale-110">
        <Icon className="h-8 w-8 text-white transition-transform duration-300 hover:rotate-12" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 hover:text-red-600">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
type StatCardProps = {
  number: string
  label: string
  delay?: number
}
// Animated Stats Component
function StatCard({ number, label, delay = 0 }: StatCardProps) {
  const [setRef, isVisible] = useIntersectionObserver();
  const [animatedNumber, setAnimatedNumber] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const target = parseInt(number.replace(/[^\d]/g, ''));
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedNumber(target);
          clearInterval(timer);
        } else {
          setAnimatedNumber(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isVisible, number]);

  return (
    <div 
      ref={setRef}
      className={`text-center transform transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl font-bold text-red-600 mb-2">
        {number.includes('%') ? `${animatedNumber}%` : 
         number.includes('+') ? `${animatedNumber}+` : animatedNumber}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

type FloatingElementProps = {
  children: React.ReactNode
  delay?: number
}

// Floating animation component
function FloatingElement({ children, delay = 0 }: FloatingElementProps) {
  return (
    <div 
      className="animate-float"
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: '3s'
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>

      {/* Header with scroll animation */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/80 backdrop-blur-sm'
      } border-b border-gray-100`}>
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global navigation">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5 flex items-center group">
              <span className="text-2xl font-bold text-red-600 transition-all duration-300 group-hover:scale-110">SITRACK</span>
              <span className="ml-2 text-sm text-gray-500 hidden sm:block transition-opacity duration-300 group-hover:opacity-75">by PT Telkom Infrastruktur Indonesia</span>
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-all duration-300 hover:scale-105">Fitur</a>
            <a href="#benefits" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-all duration-300 hover:scale-105">Manfaat</a>
            <a href="#about" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-all duration-300 hover:scale-105">Tentang</a>
          </div>
          <div className="lg:flex lg:flex-1 lg:justify-end">
            <a href="/login" className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse-glow">
              Sign In <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </nav>
      </header>

      <main className="relative isolate">
        {/* Enhanced Background with animation */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-pulse" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff8080] to-[#ff4c4c] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-float" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        {/* Hero Section with staggered animations */}
        <section className="px-6 pt-24 lg:px-8 pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all duration-300 hover:scale-105">
                <Shield className="mr-1 h-4 w-4 animate-pulse" />
                Solusi Terpercaya PT Telkom Infrastruktur Indonesia
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Revolusi Manajemen
              <span className="text-red-600 block animate-fade-in-left" style={{ animationDelay: '600ms' }}>Site Acquisition</span>
              untuk Telekomunikasi
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              SITRACK adalah platform terpadu yang mengotomatisasi seluruh proses akuisisi lahan, 
              dari perizinan hingga manajemen kontrak. Dirancang khusus untuk industri telekomunikasi Indonesia.
            </p>
            
            {/* CTA Buttons with animation */}
            <div className="mt-10 flex items-center justify-center gap-x-6 flex-wrap animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <a href="/login" className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                Akses SITRACK
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#features" className="inline-flex items-center px-6 py-4 text-lg font-semibold text-gray-900 hover:text-red-600 transition-all duration-300 hover:scale-105 group">
                Jelajahi Fitur
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Key Points with floating animation */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <FloatingElement delay={0}>
                <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
                  <Shield className="h-8 w-8 text-red-600 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-gray-900 mb-2">Keamanan Data</h3>
                  <p className="text-sm text-gray-600">Standar keamanan enterprise Telkom</p>
                </div>
              </FloatingElement>
              <FloatingElement delay={500}>
                <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
                  <Clock className="h-8 w-8 text-red-600 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
                  <p className="text-sm text-gray-600">Pantau progress 24/7</p>
                </div>
              </FloatingElement>
              <FloatingElement delay={1000}>
                <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
                  <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-3 animate-pulse" />
                  <h3 className="font-semibold text-gray-900 mb-2">Efisiensi Operasional</h3>
                  <p className="text-sm text-gray-600">Otomatisasi proses SITAC</p>
                </div>
              </FloatingElement>
            </div>
          </div>
        </section>

        {/* Problem & Solution Section with slide animations */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Masalah yang Sering Dihadapi Tim SITAC
                </h2>
                <div className="space-y-4">
                  {[
                    "Pengelolaan dokumen manual dengan Excel dan Google Drive",
                    "Kesulitan melacak progress dan status kontrak real-time",
                    "Minimnya transparansi antar tim dan stakeholder",
                    "Tidak ada historis kontrak yang tersimpan dengan baik"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start animate-fade-in-left" style={{ animationDelay: `${200 + index * 100}ms` }}>
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 animate-pulse"></div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="animate-fade-in-right">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Solusi SITRACK yang Tepat
                </h2>
                <div className="space-y-4">
                  {[
                    "Platform terpusat untuk semua aktivitas SITAC",
                    "Monitoring real-time dengan notifikasi otomatis",
                    "Transparansi penuh dengan akses berbasis role",
                    "Penyimpanan historis kontrak yang aman dan terstruktur"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start animate-fade-in-right" style={{ animationDelay: `${200 + index * 100}ms` }}>
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 mr-3 animate-bounce" style={{ animationDelay: `${index * 200}ms` }} />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with staggered animations */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 animate-fade-in-up">
                Fitur Lengkap untuk Efisiensi Maksimal
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Dirancang khusus untuk memenuhi kebutuhan tim Aset, Legal, dan Optima 
                di industri telekomunikasi Indonesia
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Feature 
                icon={Database}
                title="Dashboard Terpusat"
                description="Pantau semua site, kontrak, dan izin dalam satu tampilan visual yang komprehensif dengan analytics real-time."
                delay={0}
              />
              <Feature 
                icon={FileText}
                title="Manajemen Dokumen Digital"
                description="Generate, simpan, dan kelola semua dokumen kontrak dan perizinan secara digital dengan sistem versioning."
                delay={200}
              />
              <Feature 
                icon={Shield}
                title="Keamanan Tingkat Enterprise"
                description="Akses berbasis role dengan enkripsi data dan audit trail lengkap untuk kepatuhan regulasi."
                delay={400}
              />
              <Feature 
                icon={TrendingUp}
                title="Analytics & Reporting"
                description="Dashboard analitik dengan laporan otomatis untuk management dan stakeholder terkait."
                delay={600}
              />
              <Feature 
                icon={MapPin}
                title="Tracking Lokasi Real-time"
                description="Pelacakan status lokasi secara real-time dengan integrasi GPS dan mapping system."
                delay={800}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section with animation */}
        <section id="benefits" className="py-24 bg-gradient-to-br from-red-50 to-red-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 animate-fade-in-up">
                Manfaat untuk Tim Internal Telkom
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Transformasi digital yang memberikan dampak langsung pada efisiensi operasional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Benefit 
                icon={Clock}
                title="Efisiensi Waktu"
                description="Otomatisasi proses mengurangi waktu administrasi dan mempercepat alur kerja"
                delay={0}
              />
              <Benefit 
                icon={Users}
                title="Transparansi Penuh"
                description="Akses data real-time untuk semua stakeholder sesuai role dan privilege"
                delay={200}
              />
              <Benefit 
                icon={Shield}
                title="Minim Risiko"
                description="Validasi otomatis memastikan akurasi dokumen dan kepatuhan regulasi"
                delay={400}
              />
              <Benefit 
                icon={TrendingUp}
                title="Optimasi OPEX"
                description="Pengelolaan biaya operasional SITAC yang lebih efisien dan terukur"
                delay={600}
              />
            </div>
          </div>
        </section>

        {/* Target Users Section with cards animation */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 animate-fade-in-up">
                Untuk Tim Internal TIF
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Dirancang khusus untuk memenuhi kebutuhan operasional internal PT Telkom Infrastruktur Indonesia
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: Users, title: "Tim OPTIMA", description: "Melihat data dan perangkat serta memantau progres SSGS.", delay: 0 },
                  { icon: Shield, title: "Tim Legal", description: "Meninjau dan menyetujui kontrak secara menyeluruh.", delay: 200 },
                  { icon: MapPin, title: "Tim Aset", description: "Mengisi data lokasi, unggah berkas, dan kelola kontrak aset.", delay: 400 }
                ].map((item, index) => {
                  const [setRef, isVisible] = useIntersectionObserver();
                  return (
                    <div 
                      key={index}
                      ref={setRef}
                      className={`text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:scale-105 transform ${
                        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ animationDelay: `${item.delay}ms` }}
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-red-200 transition-all duration-300 hover:scale-110">
                        <item.icon className="h-8 w-8 text-red-600 transition-transform duration-300 hover:rotate-12" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-600 transition-colors duration-300">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with gradient animation */}
        <section className="py-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-400/10 animate-pulse"></div>
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6 animate-fade-in-up">
              Mulai Transformasi Digital SITAC Anda
            </h2>
            <p className="text-xl text-gray-300 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Wujudkan proses SITAC yang lebih efisien dengan teknologi terdepan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <a href="/login" className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                Akses SITRACK
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href="#features" className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-gray-900 rounded-xl transition-all duration-300 hover:scale-105 group">
                Pelajari Lebih Lanjut
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>
        
        {/* Footer with fade-in animation */}
        <footer className="bg-white border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2 animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-red-600 hover:scale-110 transition-transform duration-300">SITRACK</span>
                  <span className="ml-2 text-sm text-gray-500">by PT Telkom Infrastruktur Indonesia</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Platform terpadu untuk manajemen site acquisition yang efisien, transparan, dan reliable.
                </p>
                <p className="text-sm text-gray-500">
                  Solusi digital untuk masa depan telekomunikasi Indonesia yang lebih baik.
                </p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Produk</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#features" className="hover:text-red-600 transition-colors duration-300">Fitur</a></li>
                  <li><a href="#benefits" className="hover:text-red-600 transition-colors duration-300">Manfaat</a></li>
                  <li><a href="#" className="hover:text-red-600 transition-colors duration-300">Harga</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <p className="text-gray-600">
                © {new Date().getFullYear()} SITRACK - PT Telkom Infrastruktur Indonesia. 
                Semua hak dilindungi undang-undang.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}