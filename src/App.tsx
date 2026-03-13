/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Search, Loader2, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { analyzeUrl, SafetyAnalysis } from './services/geminiService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SafetyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Basic URL validation
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeUrl(formattedUrl);
      setResult(analysis);
    } catch (err) {
      setError('Failed to complete analysis. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: SafetyAnalysis['status']) => {
    switch (status) {
      case 'safe': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'dangerous': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: SafetyAnalysis['status']) => {
    switch (status) {
      case 'safe': return <ShieldCheck className="w-12 h-12" />;
      case 'warning': return <ShieldAlert className="w-12 h-12" />;
      case 'dangerous': return <XCircle className="w-12 h-12" />;
      default: return <ShieldQuestion className="w-12 h-12" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">GuardLink</span>
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            AI-Powered Security
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
            Check if a link is safe to download
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Paste any URL to analyze its safety, reputation, and potential risks before you click or download.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL here (e.g., example.com/setup.exe)"
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !url}
              className="absolute right-2 inset-y-2 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Results Section */}
        {result && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={cn("p-8 flex flex-col md:flex-row items-center gap-8", getStatusColor(result.status))}>
                <div className="shrink-0">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-3xl font-bold capitalize">{result.status}</h2>
                    <span className="px-3 py-1 rounded-full bg-white/20 border border-current text-sm font-bold">
                      Score: {result.score}/100
                    </span>
                  </div>
                  <p className="text-lg font-medium opacity-90">{result.summary}</p>
                </div>
                <div className="shrink-0">
                  <a 
                    href={url.startsWith('http') ? url : `https://${url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-semibold text-sm"
                  >
                    Visit Link <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Recommendation */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Detailed Analysis</h3>
                    <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900">
                      <Markdown>{result.details}</Markdown>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Our Recommendation</h3>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {result.recommendation}
                    </p>
                  </div>
                </div>

                {/* Threats & Quick Stats */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Identified Risks</h3>
                    <div className="space-y-2">
                      {result.threats.length > 0 ? (
                        result.threats.map((threat, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            {threat}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          No immediate threats detected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4">Safety Tips</h3>
                    <ul className="space-y-3 text-sm text-indigo-900/70">
                      <li className="flex gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        Always check the file extension (e.g., .exe, .dmg)
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        Ensure the site uses HTTPS
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        Look for verified publisher signatures
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Features */}
        {!result && !isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: 'Real-time Analysis',
                desc: 'We use Google Search grounding to check the latest security reports and domain reputation.',
                icon: <Search className="w-6 h-6 text-indigo-500" />
              },
              {
                title: 'Malware Detection',
                desc: 'Identify links known for distributing harmful software, viruses, or ransomware.',
                icon: <ShieldAlert className="w-6 h-6 text-indigo-500" />
              },
              {
                title: 'Phishing Protection',
                desc: 'Detect fraudulent websites designed to steal your sensitive information.',
                icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">
          &copy; 2026 GuardLink. Powered by Gemini AI. Always use caution when downloading files from the internet.
        </p>
      </footer>
    </div>
  );
}
