import { Metadata } from 'next';
import { TargetCoinsManager } from '@/components/TargetCoinsManager';
import { TestNotificationButton } from '@/components/TestNotificationButton';
import { SendAIAnalysisButton } from '@/components/SendAIAnalysisButton';
import { TestFullProcessButton } from '@/components/TestFullProcessButton';
import { ArrowLeft, Settings, Database, Activity, Terminal } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Protocol Config - QuantumSwing',
  description: 'Manage tracking parameters and system diagnostics',
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 group text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                  <Settings size={32} className="text-accent-blue" />
                </div>
                Configuration Hub
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Settings Area */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="animate-fade-in">
                <TargetCoinsManager />
              </div>
            </div>

            {/* Sidebar Tools area (The System Logs moved from home) */}
            <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="glass rounded-[2rem] p-8 animate-fade-in sticky top-8" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-accent-green/10 rounded-2xl border border-accent-green/20">
                    <Terminal size={24} className="text-accent-green" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Diagnostics</h2>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">System Testing & Logs</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest px-2">Manual Triggers</p>
                    <TestNotificationButton />
                    <SendAIAnalysisButton />
                    <TestFullProcessButton />
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
                     </div>
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
