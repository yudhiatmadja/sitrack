'use client'

import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Wifi, Signal } from 'lucide-react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Telkom404Page() {
  const [isVisible, setIsVisible] = useState(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Generate floating elements for background animation
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}rem`,
              height: `${element.size}rem`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`
            }}
          />
        ))}
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-spin" 
             style={{ animationDuration: '20s' }} />
        <div className="absolute top-32 right-20 w-20 h-20 bg-white transform rotate-45 animate-bounce" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-white transform rotate-12 animate-pulse" />
        <div className="absolute bottom-32 right-10 w-16 h-16 bg-white rounded-full animate-ping" 
             style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center px-6 transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Telkom Logo Area */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-4 animate-bounce">
            <Signal className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">PT. Telkom Infrastruktur Indonesia</h3>
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-8 h-1 bg-white animate-pulse" />
            <div className="w-8 h-1 bg-red-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-8 h-1 bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* 404 Display */}
        <div className="mb-8">
          <h1 className="text-9xl font-black text-white mb-4 animate-pulse drop-shadow-2xl">
            4<span className="text-red-200">0</span>4
          </h1>
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4 animate-bounce">
              Halaman Tidak Ditemukan
            </h2>
            <div className="absolute -top-2 -right-4 w-8 h-8 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-12 max-w-md mx-auto">
          <p className="text-xl text-white/90 leading-relaxed animate-fade-in">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin halaman telah dipindahkan atau tidak tersedia.
          </p>
          <div className="flex justify-center mt-6">
            <Wifi className="w-6 h-6 text-white/70 animate-pulse mr-2" />
            <div className="text-white/70">Periksa koneksi Anda</div>
          </div>
        </div>       
      </div>

      {/* Bottom Wave Animation */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="white"
            className="animate-pulse"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="white"
            style={{ animationDelay: '1s' }}
            className="animate-pulse"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="white"
            style={{ animationDelay: '2s' }}
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}