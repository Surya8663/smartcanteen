import { useEffect, useMemo, useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { storage } from '../../utils/storage';

const SAMPLE_IMAGES = {
  low: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
  medium: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  high: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
};

const CANTEEN_PROMPT = `You are an AI crowd monitoring system for a college canteen.
Analyze this canteen/restaurant image and estimate the crowd level.

Reply ONLY with this exact JSON, no extra text:
{
  "crowdLevel": "low" | "medium" | "high",
  "confidence": number between 70-99,
  "estimatedPeople": number,
  "waitTime": "estimated wait like ~5 mins",
  "recommendation": "one sentence advice for students",
  "safeToVisit": true | false,
  "details": "2 sentence observation about the crowd and seating"
}`;

const resultMeta = {
  low: {
    color: 'green',
    label: 'LOW CROWD',
    badge: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-200',
    panel: 'bg-green-50'
  },
  medium: {
    color: 'yellow',
    label: 'MODERATE CROWD',
    badge: 'bg-yellow-400',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    panel: 'bg-yellow-50'
  },
  high: {
    color: 'red',
    label: 'HIGH CROWD',
    badge: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-200',
    panel: 'bg-red-50'
  }
};

const formatTime = (date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const formatHistoryTime = (value) =>
  new Date(value).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  });

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const fetchImageAsBase64 = async (source) => {
  if (!source) {
    throw new Error('No image selected');
  }

  if (source.startsWith('data:')) {
    return source.split(',')[1] || '';
  }

  const response = await fetch(source, { mode: 'cors' });
  if (!response.ok) {
    throw new Error('Could not load image for analysis');
  }

  const blob = await response.blob();
  const dataUrl = await toDataUrl(blob);
  return dataUrl.split(',')[1] || '';
};

const parseModelResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : cleaned;
  return JSON.parse(jsonText);
};

const AdminCCTVPage = () => {
  const { showToast } = usePortal();
  const [clock, setClock] = useState(new Date());
  const [imageSource, setImageSource] = useState('');
  const [imageLabel, setImageLabel] = useState('No image uploaded');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState(() => storage.get('sc_cctv_logs', []));
  const [selectedLog, setSelectedLog] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncHistory = () => setHistory(storage.get('sc_cctv_logs', []));

    const handleBroadcast = () => syncHistory();
    window.addEventListener('storage', handleBroadcast);
    window.addEventListener('sc-cctv-logs-updated', syncHistory);

    return () => {
      window.removeEventListener('storage', handleBroadcast);
      window.removeEventListener('sc-cctv-logs-updated', syncHistory);
    };
  }, []);

  const hasImage = Boolean(imageSource);
  const currentMeta = analysis ? resultMeta[analysis.crowdLevel] || resultMeta.medium : null;

  const recentReadings = useMemo(() => history.slice(0, 5), [history]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPreviewError('');
      const dataUrl = await toDataUrl(file);
      setImageSource(dataUrl);
      setImageMimeType(file.type || 'image/jpeg');
      setImageLabel(file.name);
      setAnalysis(null);
      setSelectedLog(null);
    } catch {
      setPreviewError('Unable to load that image. Try another file.');
    }
  };

  const handleSimulate = (url, label) => {
    setImageSource(url);
    setImageMimeType('image/jpeg');
    setImageLabel(label);
    setAnalysis(null);
    setSelectedLog(null);
    setPreviewError('');
  };

  const handleAnalyze = async () => {
    if (!imageSource) {
      showToast('Upload or simulate a CCTV snapshot first.', 'info');
      return;
    }

    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      showToast('Missing VITE_CLAUDE_API_KEY for vision analysis.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64ImageData = await fetchImageAsBase64(imageSource);
      const mediaType = imageMimeType || (imageSource.startsWith('data:image/png') ? 'image/png' : 'image/jpeg');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64ImageData
                  }
                },
                {
                  type: 'text',
                  text: CANTEEN_PROMPT
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Claude vision request failed');
      }

      const data = await response.json();
      const messageText = data.content?.map((block) => block.text || '').join('\n') || '';
      const parsed = parseModelResponse(messageText);

      const normalized = {
        ...parsed,
        crowdLevel: parsed.crowdLevel || 'medium',
        confidence: Number(parsed.confidence || 0),
        estimatedPeople: Number(parsed.estimatedPeople || 0),
        safeToVisit: Boolean(parsed.safeToVisit),
        timestamp: new Date().toISOString(),
        imageSource,
        imageLabel
      };

      setAnalysis(normalized);
      setSelectedLog({ timestamp: normalized.timestamp, imageSource, imageLabel, result: normalized });
      showToast('Claude analyzed the CCTV snapshot.', 'success');
    } catch (error) {
      console.error('CCTV analysis failed:', error);
      showToast('AI vision analysis failed. Try another image.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBroadcast = () => {
    if (!analysis) return;

    const payload = {
      crowdLevel: analysis.crowdLevel,
      confidence: analysis.confidence,
      estimatedPeople: analysis.estimatedPeople,
      waitTime: analysis.waitTime,
      recommendation: analysis.recommendation,
      safeToVisit: analysis.safeToVisit,
      details: analysis.details,
      imageLabel,
      imageSource,
      updatedAt: new Date().toISOString(),
      source: 'cctv-ai'
    };

    storage.set('sc_crowd_status', payload);
    window.dispatchEvent(new CustomEvent('sc-crowd-status-updated', { detail: payload }));
    showToast('Crowd status broadcasted to all students!', 'success');
  };

  const handleLogReading = () => {
    if (!analysis) return;

    const existingLogs = storage.get('sc_cctv_logs', []);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      imageSource,
      imageLabel,
      result: analysis
    };

    const nextLogs = [entry, ...existingLogs].slice(0, 20);
    storage.set('sc_cctv_logs', nextLogs);
    setHistory(nextLogs);
    setSelectedLog(entry);
    window.dispatchEvent(new CustomEvent('sc-cctv-logs-updated', { detail: entry }));
    showToast('CCTV reading logged successfully.', 'info');
  };

  const handleReset = () => {
    setAnalysis(null);
    setSelectedLog(null);
    setPreviewError('');
  };

  const selectedResult = selectedLog?.result || null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">🎥 Live Crowd Detection</p>
        <h1 className="mt-2 text-3xl font-black text-navy sm:text-4xl">AI Vision</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Upload a canteen snapshot and let Claude AI analyze crowd density in real time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-emerald-500/30 bg-[#0d0d0d] aspect-video cctv-monitor-frame">
              <div className="scanline" />

              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-emerald-400" />
                <span className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-emerald-400" />
                <span className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-emerald-400" />
                <span className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-emerald-400" />
              </div>

              <div className="absolute left-4 top-4 z-20 font-mono text-[11px] font-bold tracking-[0.25em] text-emerald-400">
                CAM 01 — CANTEEN LIVE
              </div>
              <div className="absolute right-4 top-4 z-20 flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.2em] text-emerald-300">
                <span>{formatTime(clock)}</span>
                <span className="animate-pulse text-red-500">REC 🔴</span>
              </div>

              {hasImage ? (
                <img
                  src={imageSource}
                  alt="Canteen CCTV preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-center text-white/60">
                  <div>
                    <div className="text-6xl">📷</div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300/80">
                      Awaiting CCTV snapshot
                    </p>
                    <p className="mt-3 text-sm text-white/40">Upload a canteen image or simulate a crowd level.</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                      {imageLabel}
                    </div>
                    <div className="mt-1 text-sm text-white/75">Security monitor feed simulation</div>
                  </div>
                  {previewError ? <div className="text-xs font-semibold text-red-300">{previewError}</div> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
                📷 Upload Canteen Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">— or simulate —</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleSimulate(SAMPLE_IMAGES.low, 'Simulated Low Crowd')}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                🟢 Low Crowd
              </button>
              <button
                type="button"
                onClick={() => handleSimulate(SAMPLE_IMAGES.medium, 'Simulated Medium Crowd')}
                className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800 transition hover:-translate-y-0.5 hover:bg-yellow-100"
              >
                🟡 Medium Crowd
              </button>
              <button
                type="button"
                onClick={() => handleSimulate(SAMPLE_IMAGES.high, 'Simulated High Crowd')}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:-translate-y-0.5 hover:bg-red-100"
              >
                🔴 High Crowd
              </button>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imageSource}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isAnalyzing ? 'Analyzing with Claude AI...' : '🤖 Analyze with Claude AI'}
            </button>
          </div>

          {analysis ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft cctv-pop-in">
              <div className={`flex items-center justify-center ${resultMeta[analysis.crowdLevel]?.panel || 'bg-green-50'} px-6 py-10`}>
                <div className="text-center">
                  <div
                    className={`mx-auto grid h-28 w-28 place-items-center rounded-full ${resultMeta[analysis.crowdLevel]?.badge || 'bg-green-500'} text-white shadow-2xl`}
                    style={{ boxShadow: '0 0 0 0 rgba(34,197,94,0.25)' }}
                  >
                    <div className="text-4xl font-black leading-none">
                      {analysis.crowdLevel === 'low' ? '🟢' : analysis.crowdLevel === 'medium' ? '🟡' : '🔴'}
                    </div>
                  </div>
                  <div className={`mt-5 text-3xl font-black uppercase tracking-[0.2em] ${resultMeta[analysis.crowdLevel]?.text || 'text-green-600'}`}>
                    {resultMeta[analysis.crowdLevel]?.label || 'LOW CROWD'}
                  </div>
                  <div className="mt-2 text-2xl font-black text-navy">{analysis.crowdLevel.toUpperCase()}</div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-slate-200 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['👥 Estimated People', analysis.estimatedPeople],
                  ['⏱️ Wait Time', analysis.waitTime],
                  ['🎯 AI Confidence', `${analysis.confidence}%`],
                  ['✅ Safe to Visit', analysis.safeToVisit ? 'Yes' : 'No']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</div>
                    <div className="mt-2 text-xl font-black text-navy">{value}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 px-5 py-5">
                <div className="rounded-2xl border-l-4 border-brand bg-brand/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand">AI Recommendation</div>
                      <p className="mt-2 text-base font-semibold text-navy">{analysis.recommendation}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{analysis.details}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBroadcast}
                    className="flex-1 rounded-2xl bg-navy px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand"
                  >
                    📢 Broadcast to Students
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
                  >
                    🔄 Re-analyze
                  </button>
                  <button
                    type="button"
                    onClick={handleLogReading}
                    className="flex-1 rounded-2xl border border-brand/20 bg-brand/10 px-5 py-3.5 text-sm font-semibold text-brand transition hover:bg-brand/20"
                  >
                    📋 Log This Reading
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Detection History</div>
            <div className="mt-1 text-lg font-black text-navy">Last 5 readings</div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">People</th>
                    <th className="px-4 py-3">Wait Time</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReadings.length > 0 ? (
                    recentReadings.map((entry) => {
                      const reading = entry.result || entry;
                      const meta = resultMeta[reading.crowdLevel] || resultMeta.medium;

                      return (
                        <tr key={entry.id || entry.timestamp} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-slate-600">{formatHistoryTime(entry.timestamp)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${meta.badge}`}>
                              {reading.crowdLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{reading.estimatedPeople || 0}</td>
                          <td className="px-4 py-3 text-slate-700">{reading.waitTime || '~5 min'}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(entry)}
                              className="text-sm font-semibold text-brand hover:text-brand/80"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-sm text-slate-500" colSpan="5">
                        No readings logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedResult ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Reading Preview</div>
              <div className="mt-2 text-lg font-black text-navy">{selectedLog?.imageLabel || 'Logged snapshot'}</div>
              {selectedLog?.imageSource ? (
                <img
                  src={selectedLog.imageSource}
                  alt="Logged CCTV snapshot"
                  className="mt-4 h-48 w-full rounded-2xl object-cover"
                />
              ) : null}
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold text-navy">Status:</span> {selectedResult.crowdLevel}</p>
                <p><span className="font-semibold text-navy">People:</span> {selectedResult.estimatedPeople}</p>
                <p><span className="font-semibold text-navy">Wait:</span> {selectedResult.waitTime}</p>
                <p><span className="font-semibold text-navy">Safe:</span> {selectedResult.safeToVisit ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
};

export default AdminCCTVPage;