import { Metadata } from 'next';
import { TestNotificationButton } from '@/components/TestNotificationButton';
import { SendAIAnalysisButton } from '@/components/SendAIAnalysisButton';
import { TestFullProcessButton } from '@/components/TestFullProcessButton';
import { DebugPortfolioButton } from '@/components/DebugPortfolioButton';
import { Settings, Terminal, Zap, Wallet, Brain, Send, Bot, Activity } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings - QuantumSwing',
  description: 'System diagnostics and tools',
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Nav */}
      <aside className="hidden lg:flex flex-col w-20 xl:w-64 glass border-r border-white/5 py-8 px-4 fixed h-full z-50">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-accent-green flex items-center justify-center shadow-lg shadow-accent-green/20">
            <Zap className="text-dark-background" size={24} />
          </div>
          <span className="hidden xl:block font-extrabold text-xl tracking-tighter text-white">Quantum<span className="text-accent-green">Swing</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: Activity, label: 'Dashboard', href: '/' },
            { icon: Wallet, label: 'Portfolio', href: '#' },
            { icon: Brain, label: 'AI Strategy', href: '#' },
            { icon: Bot, label: 'Markets', href: '#' },
            { icon: Send, label: 'Alerts', href: '#' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 text-text-secondary hover:bg-white/5 hover:text-white"
            >
              <item.icon size={22} />
              <span className="hidden xl:block font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <Link href="/settings" className="flex items-center gap-4 px-3 py-3 rounded-2xl bg-accent-green/10 text-accent-green">
            <Settings size={22} className="drop-shadow-[0_0_8px_rgba(37,229,126,0.5)]" />
            <span className="hidden xl:block font-medium text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-20 xl:ml-64 min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="px-6 md:px-10 py-12 relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 group text-sm font-bold uppercase tracking-widest">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                <Settings size={32} className="text-accent-blue" />
              </div>
              System Diagnostics
            </h1>
            <p className="text-text-secondary mt-3 text-sm">
              Assets are automatically synced from your portfolio data.
            </p>
          </div>

          {/* Diagnostics Card */}
          <div className="glass rounded-[2rem] p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent-green/10 rounded-2xl border border-accent-green/20">
                <Terminal size={24} className="text-accent-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Diagnostics</h2>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">System Testing & Logs</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest px-2">Manual Triggers</p>
                <TestNotificationButton />
                <SendAIAnalysisButton />
                <TestFullProcessButton />
              </div>

              <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-white/5">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest px-2 text-violet-400">Data Integrity Check</p>
                <DebugPortfolioButton />
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest px-2">Data Status</p>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Webhook Pipeline</span>
                    <span className="text-accent-green font-bold">READY</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Analysis Engine</span>
                    <span className="text-accent-blue font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Asset Source</span>
                    <span className="text-accent-green font-bold">PORTFOLIO AUTO-SYNC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
