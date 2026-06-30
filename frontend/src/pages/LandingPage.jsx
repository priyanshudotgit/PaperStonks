import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* 1. Navbar Section */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-black tracking-tight">
            PaperStonks
          </div>
          <div className="hidden md:flex space-x-8">
            <a className="text-gray-600 font-medium hover:text-black transition-colors text-sm" href="#platform">Platform</a>
            <a className="text-gray-600 font-medium hover:text-black transition-colors text-sm" href="#market-data">Market Data</a>
            <a className="text-gray-600 font-medium hover:text-black transition-colors text-sm" href="#education">Education</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 font-medium hover:text-black transition-colors text-sm hidden md:block">
              Log In
            </Link>
            <Link to="/register" className="bg-black text-white hover:bg-gray-800 transition-colors rounded-lg px-4 py-2 text-sm font-medium shadow-sm flex items-center justify-center">
              Start Trading
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="flex-grow pt-[80px]">
        <section className="relative  flex items-center overflow-hidden py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start gap-6">
              <FadeIn delay={300}>
                <h1 className="text-4xl md:text-3xl font-bold text-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  Master the Stock Market Without Risking Real Money
                </h1>
              </FadeIn>
              
              <FadeIn delay={500}>
                <p className="text-lg text-gray-600">
                  Experience the thrill of trading with a ₹100,000 virtual portfolio. Our professional grade platform provides real-time market data in a completely risk-free environment.
                </p>
              </FadeIn>
              
              <FadeIn delay={700} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="bg-black text-white hover:bg-gray-800 transition-colors rounded-lg px-6 py-3 text-sm font-medium shadow-md flex items-center justify-center gap-2">
                  Start Trading Free
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <button className="bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors rounded-lg px-6 py-3 text-sm font-medium shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  View Demo
                </button>
              </FadeIn>
            </div>

            {/* Right Content - Mockup */}
            <FadeIn delay={900} className="relative hidden lg:block">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 border border-gray-200 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mockup Top Bar */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-500">account_balance_wallet</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Total Portfolio Value</div>
                      <div className="text-xl text-black font-semibold">₹124,530.00</div>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    +24.5% All Time
                  </div>
                </div>

                {/* Mockup Chart */}
                <div className="h-48 w-full bg-gray-50 border border-gray-100 rounded-lg mb-6 relative overflow-hidden">
                  <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <path d="M0,100 L0,80 C50,90 100,50 150,60 C200,70 250,30 300,40 C350,50 400,10 400,10 L400,100 Z" fill="url(#gradient-green)" opacity="0.2"></path>
                    <path d="M0,80 C50,90 100,50 150,60 C200,70 250,30 300,40 C350,50 400,10 400,10" fill="none" stroke="#067647" strokeWidth="2"></path>
                    <defs>
                      <linearGradient id="gradient-green" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#067647"></stop>
                        <stop offset="100%" stopColor="rgba(6, 118, 71, 0)"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Mockup Holdings */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-700">RELI</div>
                      <div>
                        <div className="text-sm text-black font-medium">Reliance Ind.</div>
                        <div className="text-xs text-gray-500">15 Shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black font-mono font-medium">₹37,500.00</div>
                      <div className="text-xs text-green-700 font-medium">+5.2%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-700">HDFC</div>
                      <div>
                        <div className="text-sm text-black font-medium">HDFC Bank</div>
                        <div className="text-xs text-gray-500">20 Shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black font-mono font-medium">₹32,000.00</div>
                      <div className="text-xs text-red-600 font-medium">-1.4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
          </div>
        </section>
      </main>

      {/* 3. Footer Section */}
      <footer className="w-full border-t border-gray-200 bg-white text-gray-800">
        <div className="w-full px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto">
          <div className="flex flex-col gap-3">
            <div className="text-xl font-bold text-black">
              PaperStonks
            </div>
            <div className="text-sm text-gray-500 mt-2">
              © 2026 PaperStonks. Professional Paper Trading for the Modern Era.
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
            <div className="flex flex-col gap-3">
              <span className="text-sm text-black font-bold mb-2">Product</span>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#features">Features</a>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#pricing">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-black font-bold mb-2">Company</span>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#about">About</a>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#contact">Contact</a>
            </div>
            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
              <span className="text-sm text-black font-bold mb-2">Legal</span>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#privacy">Privacy Policy</a>
              <a className="text-gray-500 hover:text-black text-sm transition-colors" href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}