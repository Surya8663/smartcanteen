import React, { useState, useEffect } from 'react';
import CrowdBadge from '../../components/admin/CrowdBadge';
import { getOrdersFromStorage } from '../../utils/adminData';
import { usePortal } from '../../context/PortalContext';
import { storage } from '../../utils/storage';

const SLOT_MAP = [
  { id: 's1', time: '12:00 PM – 12:15 PM', capacity: 50 },
  { id: 's2', time: '12:15 PM – 12:30 PM', capacity: 50 },
  { id: 's3', time: '12:30 PM – 12:45 PM', capacity: 50 },
  { id: 's4', time: '12:45 PM – 1:00 PM', capacity: 50 },
  { id: 's5', time: '1:00 PM – 1:15 PM', capacity: 50 },
  { id: 's6', time: '1:15 PM – 1:30 PM', capacity: 50 }
];

const getSlotOrderCount = (slotId) => {
  const allOrders = JSON.parse(localStorage.getItem('sc_orders') || '[]');
  if (!Array.isArray(allOrders)) return 0;
  return allOrders.filter((o) => o.pickupSlot === slotId).length;
};

const getSlotCrowdLevel = (slotId, count) => {
  if ((slotId === 's5' || slotId === 's6') && count >= 8) return 'high';
  if (count <= 10) return 'low';
  if (count <= 25) return 'medium';
  return 'high';
};

const crowdMeta = {
  low: { emoji: '🟢', people: 8, waitTime: '~5 mins', recommendation: 'Great time to visit now.' },
  medium: { emoji: '🟡', people: 18, waitTime: '~12 mins', recommendation: 'Expect moderate queue, order ahead.' },
  high: { emoji: '🔴', people: 34, waitTime: '~20 mins', recommendation: 'Avoid peak; choose a later slot.' }
};

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const parseClaudeJson = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
};

export default function AdminCrowdPage() {
  const { notify } = usePortal();
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [crowdLevel, setCrowdLevel] = useState('low');
  const [chartData, setChartData] = useState([]);
  const [uploadImage, setUploadImage] = useState('');
  const [uploadImageType, setUploadImageType] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const slotData = SLOT_MAP.map((slot) => {
      const orderCount = getSlotOrderCount(slot.id);
      const crowdLevel = getSlotCrowdLevel(slot.id, orderCount);
      return {
        ...slot,
        orderCount,
        crowdLevel,
        fillPercent: Math.min((orderCount / 50) * 100, 100)
      };
    });

    setSlots(slotData);

    setActiveSlot(slotData[slotData.length - 1]);

    const totalOrders = slotData.reduce((sum, s) => sum + s.orderCount, 0);
    setCrowdLevel(totalOrders > 50 ? 'high' : totalOrders > 25 ? 'medium' : 'low');

    setChartData(slotData.map((s) => ({ name: s.time, value: s.orderCount, capacity: s.capacity, crowdLevel: s.crowdLevel })));
  }, []);

  const calculateCrowdPercentage = (slot) => {
    return Math.round((Number(slot.orderCount || 0) / Number(slot.capacity || 50)) * 100);
  };

  const broadcastStatus = (payload, mode = 'success') => {
    const nextStatus = {
      ...payload,
      updatedAt: new Date().toISOString(),
      source: payload.source || 'admin-crowd'
    };

    storage.set('sc_crowd_status', nextStatus);
    window.dispatchEvent(new CustomEvent('sc-crowd-status-updated', { detail: nextStatus }));
    notify('Crowd status broadcasted to all students!', mode);
  };

  const handleSimulate = (level) => {
    const preset = crowdMeta[level];
    broadcastStatus(
      {
        crowdLevel: level,
        estimatedPeople: preset.people,
        confidence: 95,
        waitTime: preset.waitTime,
        recommendation: preset.recommendation,
        safeToVisit: level !== 'high',
        source: 'simulated'
      },
      'info'
    );
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await toDataUrl(file);
      setUploadImage(dataUrl);
      setUploadImageType(file.type || 'image/jpeg');
      setAiResult(null);
    } catch {
      notify('Could not load selected image.', 'error');
    }
  };

  const analyzeWithAi = async () => {
    if (!uploadImage) {
      notify('Upload a canteen image first.', 'info');
      return;
    }

    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      notify('Missing VITE_CLAUDE_API_KEY in env.', 'error');
      return;
    }

    setAnalyzing(true);
    try {
      const base64 = uploadImage.split(',')[1] || '';
      const promptText = `You are a crowd monitoring AI for a college canteen.
Analyze this image and estimate crowd density.
Reply ONLY in this JSON format, no extra text:
{
  "crowdLevel": "low" | "medium" | "high",
  "estimatedPeople": number,
  "confidence": number,
  "waitTime": "~X mins",
  "recommendation": "one sentence for students"
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: uploadImageType || 'image/jpeg',
                    data: base64
                  }
                },
                {
                  type: 'text',
                  text: promptText
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Claude request failed');
      }

      const payload = await response.json();
      const text = payload.content?.map((block) => block.text || '').join('\n') || '';
      const parsed = parseClaudeJson(text);

      const normalized = {
        crowdLevel: parsed.crowdLevel || 'medium',
        estimatedPeople: Number(parsed.estimatedPeople || 0),
        confidence: Number(parsed.confidence || 0),
        waitTime: parsed.waitTime || '~10 mins',
        recommendation: parsed.recommendation || 'Moderate crowd expected.',
        safeToVisit: (parsed.crowdLevel || 'medium') !== 'high',
        source: 'claude-vision',
        updatedAt: new Date().toISOString()
      };

      setAiResult(normalized);
      notify('AI analysis completed. Ready to broadcast.', 'success');
    } catch (error) {
      console.error(error);
      notify('AI analysis failed for this image.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Active Slot Card */}
      {activeSlot && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 shadow-lg text-white">
          <p className="text-sm opacity-90 mb-1">Currently Active Slot</p>
          <h2 className="text-3xl font-bold mb-3">{activeSlot.time}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Orders</p>
              <p className="text-2xl font-semibold">{activeSlot.orderCount}/{activeSlot.capacity}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Capacity</p>
              <p className="text-2xl font-semibold">{calculateCrowdPercentage(activeSlot)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Crowd Level */}
      <div className="flex items-center gap-4 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div>
          <p className="text-gray-600 text-sm mb-2">Overall Crowd Level</p>
          <CrowdBadge level={crowdLevel} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Recommendation: {
            crowdLevel === 'high' ? '🔴 Critical - Direct traffic to alternative slots' :
            crowdLevel === 'medium' ? '🟡 Monitor - Prepare for peak times' :
            '🟢 Normal - All slots operating smoothly'
          }</p>
        </div>
      </div>

      {/* Slot Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">{slot.time}</h3>
              <CrowdBadge level={slot.crowdLevel} />
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Orders</span>
                <span>{slot.orderCount}/{slot.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    slot.crowdLevel === 'high' ? 'bg-red-500' :
                    slot.crowdLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(calculateCrowdPercentage(slot), 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-center text-lg font-bold text-gray-900">{calculateCrowdPercentage(slot)}%</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                slot.crowdLevel === 'high' ? 'bg-red-100 text-red-700' :
                slot.crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {slot.crowdLevel.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Order Distribution</h2>
        <div className="space-y-4">
          {chartData.map((slot, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{slot.name}</span>
                <span className="text-gray-600">{slot.value}/{slot.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-orange-500 h-3 rounded-full"
                  style={{ width: `${Math.min((slot.value / slot.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-900 font-semibold mb-2">🤖 AI Recommendation</p>
        <p className="text-blue-800 text-sm leading-relaxed">
          Based on current crowd distribution, we recommend distributing the next batch of orders to the evening slots (3-5 PM and 5-7 PM) which currently have lower occupancy. This will optimize preparation time and reduce peak-hour stress.
        </p>
      </div>

      {/* AI Crowd Broadcast */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-navy">📡 AI Crowd Broadcast</h2>
          <p className="mt-1 text-sm text-slate-600">Simulate quick crowd states or upload a canteen image for Claude vision analysis.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleSimulate('low')}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            🟢 Simulate Low
          </button>
          <button
            type="button"
            onClick={() => handleSimulate('medium')}
            className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800 hover:bg-yellow-100"
          >
            🟡 Simulate Medium
          </button>
          <button
            type="button"
            onClick={() => handleSimulate('high')}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 hover:bg-red-100"
          >
            🔴 Simulate High
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
              📷 Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadFile} />
            </label>
            <button
              type="button"
              onClick={analyzeWithAi}
              disabled={!uploadImage || analyzing}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {analyzing ? 'Analyzing...' : '🤖 Upload & Analyze with AI'}
            </button>
          </div>

          {uploadImage ? (
            <img src={uploadImage} alt="Canteen upload" className="h-48 w-full rounded-lg object-cover" />
          ) : null}

          {aiResult ? (
            <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
              <p className="text-sm font-semibold text-brand">AI Result</p>
              <p className="mt-2 text-lg font-bold capitalize">{aiResult.crowdLevel} crowd</p>
              <p className="text-sm text-slate-700">👥 {aiResult.estimatedPeople} people • ⏱️ {aiResult.waitTime} • 🎯 {aiResult.confidence}%</p>
              <p className="mt-1 text-sm text-slate-600">{aiResult.recommendation}</p>
              <button
                type="button"
                onClick={() => broadcastStatus(aiResult)}
                className="mt-3 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand"
              >
                📢 Broadcast to Students
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
