import { Metadata } from 'next';
import { TargetCoinsManager } from '@/components/TargetCoinsManager';

export const metadata: Metadata = {
  title: 'Pengaturan - Crypto Swing Analyzer',
  description: 'Konfigurasikan kripto target Anda untuk analisis',
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-violet-200 bg-clip-text text-transparent mb-4">
              Pengaturan
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Konfigurasikan preferensi pelacakan kriptocurrency Anda dan kelola koin target untuk analisis
            </p>
          </div>

          <TargetCoinsManager />
        </div>
      </div>
    </div>
  );
}