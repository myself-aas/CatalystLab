import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Zap, Clock, ShieldCheck, Lock, Terminal, Globe, Award, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b192c] font-sans selection:bg-cyan-500/25 selection:text-cyan-900">
      <SEOHead
        title="About Us & Philosophy — CatalystLab"
        description="Learn about CatalystLab, our vision, mission, partners, and why thousands of engineering teams trust our multi-dimensional web health platform."
        keywords={['CatalystLab about us', 'web telemetry mission', 'vision', 'partners', 'why choose us']}
        canonicalUrl="https://www.catalystlab.tech/about"
      />

      {/* Hero Banner with Professional Image */}
      <section className="relative w-full h-[55vh] min-h-[420px] bg-[#0b192c] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Visual asset" 
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1800" 
            alt="Professional using digital device" 
            className="w-full h-full object-cover opacity-45 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b192c]/60 via-[#0b192c]/40 to-[#f8fafc]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 mb-2">
            <Link to="/" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">About Us</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0b192c]">
            About CatalystLab
          </h1>
          <p className="mt-3 max-w-xl text-lg text-slate-700 font-medium">
            Building the gold standard in multi-dimensional web health, OWASP security, and digital telemetry infrastructure.
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <LazyReveal direction="left" className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <span>🔥</span> What We Do
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0b192c] leading-tight">
              Who We Are
            </h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">
              CatalystLab is a fast, reliable and user-friendly platform for managing web utility bills, security audits, and financial intelligence services.
            </p>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              At CatalystLab, we are committed to simplifying how utility and web assets are managed whilst providing an easy way for electricity, data, airtime and cable subscriptions, alongside robust enterprise security telemetry.
            </p>
            <div>
              <Link 
                to="/pricing" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
              </Link>
            </div>
          </LazyReveal>

          <LazyReveal direction="right">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3] bg-slate-100">
              <img alt="Visual asset" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" 
                alt="Professional working on laptop" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          </LazyReveal>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <LazyReveal direction="left" className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3] bg-slate-100">
                <img alt="Visual asset" 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                  alt="Engineer analyzing metrics" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>
            </LazyReveal>

            <LazyReveal direction="right" className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 text-xs font-bold uppercase tracking-wider">
                <span>🔥</span> What Drives Us
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0b192c]">
                Vision and Mission
              </h2>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-[#0b192c] mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Vision
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    To become the world's most trusted technology company for digital utility management and bill payment leveraging on technological innovation to drive excellence.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-[#0b192c] mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    Mission
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    Empowering users with innovative digital solutions for utility management and bill payment whilst ensuring convenience, efficiency and an exceptional customer service.
                  </p>
                </div>
              </div>
            </LazyReveal>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <LazyReveal direction="up" className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <span>🔥</span> Who We Collaborate With
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b192c]">
            Our Partners
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            We work alongside industry-leading financial, utility, and cloud infrastructure partners to guarantee seamless service delivery.
          </p>
        </LazyReveal>

        <LazyStaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center" staggerDelay={0.08}>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-xl font-black text-slate-800 tracking-tight">paga</span>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-xl font-bold text-orange-600 flex items-center gap-1">⚡ Ikeja</span>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-lg font-black text-blue-900 tracking-wider">EKEDC</span>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-lg font-black text-indigo-900 tracking-wider">AEDC</span>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-lg font-bold text-slate-700">Cloudflare</span>
            </div>
          </LazyStaggerItem>
          <LazyStaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <span className="text-lg font-bold text-cyan-700">Stripe</span>
            </div>
          </LazyStaggerItem>
        </LazyStaggerContainer>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <span>🔥</span> What Makes Us Stand Out
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Why Choose Us
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                We have a plethora of reasons CatalystLab should be your go-to app to manage and pay your utility bills and web health telemetry.
              </p>
              <div>
                <Link 
                  to="/pricing" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-xl shadow-lg hover:border-emerald-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Utility Bill Payment</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We prioritize our user needs whilst ensuring a safe and secure way to manage and pay utility bills.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-xl shadow-lg hover:border-amber-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">24/7 Access To The App</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Users have 24/7 access to the CatalystLab app to manage utility bill payments and uptime telemetry.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-xl shadow-lg hover:border-cyan-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tested and Trusted</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We have been tested and trusted by Nigerians to manage and pay utility bills efficiently.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-xl shadow-lg hover:border-rose-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Safe and User Centric</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We prioritize the needs of users whilst ensuring a safe and secure way to manage and pay utility bills.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
