import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { seedDemoData } from '../utils/demoData';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    description: 'Claude AI suggests the fastest pickup slot & best menu items for your preferences.'
  },
  {
    icon: '🎥',
    title: '🎥 AI Vision Crowd Detection',
    description: 'Real-time CCTV analysis powered by Claude AI — know before you go and avoid the rush.'
  },
  {
    icon: '🏆',
    title: 'Mess Points Rewards',
    description: 'Earn 1 point per rupee, unlock badges, and compete on leaderboards for streaks & top spenders.'
  },
  {
    icon: '🎟️',
    title: 'Digital QR Coupons',
    description: 'Skip the slip — show your QR code at pickup. Printable, downloadable, shareable.'
  },
  {
    icon: '♻️',
    title: 'Zero Food Wastage',
    description: 'AI forecasting helps admins prep exact quantities. Reduce waste by 80%, cut costs by 25%.'
  },
  {
    icon: '📊',
    title: 'Instant Admin Control',
    description: 'Real-time dashboards, crowd heatmaps, demand forecasts, and one-click menu updates.'
  }
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Choose Your Food',
    description: 'Browse the menu on your phone, use AI Search for personalized picks, add to cart.'
  },
  {
    step: '2',
    title: 'Pay Digitally',
    description: 'Checkout in seconds with UPI/Card. AI recommends the fastest pickup slot.'
  },
  {
    step: '3',
    title: 'Skip the Line',
    description: 'Show your QR code at pickup, collect your order, earn mess points instantly.'
  }
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [stats] = useState([
    { icon: '🎓', label: 'Students', value: '2,400+' },
    { icon: '🍽️', label: 'Orders Saved', value: '48,000+' },
    { icon: '⏱️', label: 'Avg Time Saved', value: '35 min' }
  ]);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll navigation
  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoClick = () => {
    const result = seedDemoData();
    console.log('Demo data seeded:', result);
    // Show toast and redirect
    window.location.href = '/student/dashboard';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-slate-50 text-navy">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 backdrop-blur shadow-soft">
          <div className="relative grid gap-16 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-20">
            {/* Left Column */}
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
                🍽️ Smart College Canteen
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Skip the Queue. <br /> Order Smart.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                SmartCanteen revolutionizes college dining with AI-powered recommendations, real-time crowd tracking, and gamified rewards. Never waste time in line again.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand/90 btn-ripple"
                >
                  🚀 Login Now
                </Link>
                <button
                  onClick={handleDemoClick}
                  className="inline-flex items-center justify-center rounded-full border-2 border-brand px-7 py-3 text-base font-semibold text-brand transition-all duration-200 hover:bg-brand/10"
                >
                  🎮 Try Demo
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  ['25+', 'Menu Items'],
                  ['2 Roles', 'Student & Admin'],
                  ['♻️ 80%', 'Less Waste']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-gradient-to-br from-orange-50 to-slate-50 border border-orange-100 p-4 card-hover">
                    <div className="text-2xl font-extrabold text-brand">{value}</div>
                    <div className="mt-1 text-sm text-slate-600 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Mockup */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand/10 via-transparent to-navy/5 blur-2xl" />
              <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg card-hover">
                <div className="rounded-2xl bg-gradient-to-br from-brand to-brand/80 p-6 text-white">
                  <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Live Status</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-5xl font-black">09</div>
                      <div className="mt-1 text-sm text-white/70">orders ahead</div>
                    </div>
                    <div className="rounded-xl bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-bold">⏱️ 4 min</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[['🤖', 'AI Smart'], ['🔄', 'Real-time'], ['🏆', 'Rewards'], ['📊', 'Analytics']].map(([icon, label]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3 hover:bg-orange-50 transition">
                      <div className="text-xl">{icon}</div>
                      <div className="mt-1 text-xs font-bold text-slate-700">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-2xl bg-gradient-to-r from-brand/10 via-orange-50 to-slate-50 border border-orange-200 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-around">
              {stats.map((stat, i) => (
                <div key={i} className="text-center count-animate" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="mt-2 text-2xl font-black text-brand">{stat.value}</div>
                  <div className="text-sm text-slate-600 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              📱 How It Works
            </span>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-navy sm:text-4xl">
              Three simple steps to skip the queue
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map((item, idx) => (
            <ScrollReveal key={item.step}>
              <div className="relative">
                {/* Connector line */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden absolute top-24 left-[calc(50%+60px)] w-[calc(100%-80px)] h-1 bg-gradient-to-r from-brand/50 to-transparent md:block" />
                )}

                <div className="rounded-2xl bg-white border-2 border-orange-100 p-8 hover:border-brand hover:shadow-lg transition-all card-hover">
                  {/* Step Number */}
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/80 text-3xl font-black text-white">
                    {item.step}
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-navy">{item.title}</h3>
                  <p className="mt-3 text-slate-600 leading-7">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              ✨ Powered Features
            </span>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-navy sm:text-4xl">
              Everything you need for smarter campus dining
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <ScrollReveal key={feature.title}>
              <div className="group rounded-2xl bg-white border-2 border-slate-100 p-8 hover:border-brand hover:shadow-xl transition-all card-hover duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-black text-navy">{feature.title}</h3>
                <p className="mt-3 text-slate-600 leading-7">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-3xl bg-gradient-to-r from-navy via-brand/20 to-brand/10 px-8 py-16 sm:px-12 sm:py-20 text-center border border-brand/20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-black text-white sm:text-5xl">Ready to transform your canteen?</h2>
              <p className="mt-6 text-lg text-white/80">Join 2,400+ students already skipping queues and earning rewards.</p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-brand transition-all hover:scale-105 btn-ripple"
                >
                  🚀 Get Started Now
                </Link>
                <button
                  onClick={handleDemoClick}
                  className="inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition"
                >
                  🎮 Live Demo
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-navy text-white px-4 py-12 sm:px-6 lg:px-8 mt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🍽️</span>
                <div>
                  <div className="text-lg font-black">SmartCanteen</div>
                  <div className="text-xs text-white/60">Skip the queue</div>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-6">Built for better campus life. Serving students & admins with speed, fairness, and rewards.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }} className="hover:text-white transition">How It Works</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }} className="hover:text-white transition">Features</a></li>
                <li><a href="/login" className="hover:text-white transition">Login</a></li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="font-bold mb-4">Tech Stack</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>⚛️ React + Vite</li>
                <li>🎨 Tailwind CSS</li>
                <li>🤖 Claude AI (Anthropic)</li>
                <li>📱 Progressive Web App</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact: hello@smartcanteen.local</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>© 2025 SmartCanteen. Made with ❤️ for better campus life.</p>
            <p className="mt-2">Skip the queue. Order smart. Never waste food again. 🚀</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
