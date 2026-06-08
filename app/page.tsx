'use client';

import { useState } from 'react';
import { ROOM_TYPES, STYLES, BUDGETS } from '@/lib/data';

interface GeneratedImage {
  url: string | null;
  prompt: string;
  index: number;
}

interface FormState {
  roomType: string;
  length: string;
  width: string;
  style: string;
  budget: string;
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    roomType: '',
    length: '',
    width: '',
    style: 'contemporary Indian',
    budget: 'mid-range 2 to 5 lakhs INR',
  });

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleGenerate = async () => {
    if (!form.roomType) { setError('Please select a room type'); return; }
    if (!form.length || !form.width) { setError('Please enter room dimensions'); return; }
    setError('');
    setLoading(true);
    setImages([]);
    setSelectedIndex(null);
    setGeneratedPrompt(`${form.style} ${form.roomType} · ${form.length}ft × ${form.width}ft`);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImages(data.images || []);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const area = form.length && form.width
    ? parseInt(form.length) * parseInt(form.width)
    : null;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Griha AI</h1>
            <p className="text-xs text-stone-400 mt-0.5">Indian interior design visualizer</p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full">
            Beta
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">

          {/* Left: Form */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-800">Room details</h2>
              <p className="text-sm text-stone-400 mt-1">Fill in your room specs to generate designs</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
              {/* Room type */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                  Room type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_TYPES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setForm(f => ({ ...f, roomType: r.value }))}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                        form.roomType === r.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                  Room dimensions (feet)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Length"
                    value={form.length}
                    onChange={e => setForm(f => ({ ...f, length: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-teal-400"
                    min={6} max={60}
                  />
                  <span className="text-stone-300 text-lg font-light">×</span>
                  <input
                    type="number"
                    placeholder="Width"
                    value={form.width}
                    onChange={e => setForm(f => ({ ...f, width: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-teal-400"
                    min={6} max={60}
                  />
                </div>
                {area && (
                  <p className="text-xs text-stone-400 mt-1.5">{area} sq ft total area</p>
                )}
              </div>

              {/* Style */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                  Design style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setForm(f => ({ ...f, style: s.value }))}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                        form.style === s.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                  Budget
                </label>
                <select
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-800 focus:outline-none focus:border-teal-400"
                >
                  {BUDGETS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating designs...' : 'Generate room designs'}
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {!loading && images.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <p className="text-stone-400 text-sm">Your room designs will appear here</p>
                <p className="text-stone-300 text-xs mt-1">Fill in the form and hit generate</p>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {generatedPrompt && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                    <span className="text-xs text-stone-500 font-mono">{generatedPrompt}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="rounded-xl overflow-hidden border border-stone-200">
                      <div
                        className="w-full bg-stone-100 animate-pulse"
                        style={{ aspectRatio: '4/3' }}
                      />
                      <div className="p-2 bg-white">
                        <div className="h-3 bg-stone-100 rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-stone-400">
                  Generating 4 unique designs · takes ~30 seconds
                </p>
              </div>
            )}

            {!loading && images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-stone-800">
                      {images.length} design ideas
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">{generatedPrompt}</p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="text-xs text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Regenerate
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
                      className={`rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        selectedIndex === i
                          ? 'border-teal-500 ring-2 ring-teal-100'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={`Room design ${i + 1}`}
                          className="w-full object-cover"
                          style={{ aspectRatio: '4/3' }}
                        />
                      ) : (
                        <div
                          className="w-full bg-stone-100 flex items-center justify-center"
                          style={{ aspectRatio: '4/3' }}
                        >
                          <span className="text-xs text-stone-400">Failed to generate</span>
                        </div>
                      )}
                      <div className="p-2 bg-white flex items-center justify-between">
                        <span className="text-xs text-stone-500">Design {i + 1}</span>
                        {selectedIndex === i && (
                          <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedIndex !== null && (
                  <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Prompt used for design {selectedIndex + 1}
                    </p>
                    <p className="text-xs text-stone-600 font-mono leading-relaxed">
                      {images[selectedIndex]?.prompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
