import { useEffect, useMemo, useState } from 'react';

const AnimatedDots = () => {
  return (
    <div className="mt-2 flex items-center justify-center gap-1">
      <span className="payment-dot" />
      <span className="payment-dot" />
      <span className="payment-dot" />
    </div>
  );
};

const drawTransactionId = () => {
  const random = Math.floor(100000000000 + Math.random() * 900000000000);
  return `TXN${random}`;
};

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const PaymentModal = ({
  isOpen,
  phase,
  amount,
  selectedMethod,
  selectedUpi,
  onCancel,
  onPhaseComplete,
  onTransactionReady
}) => {
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(45);
  const [transactionId, setTransactionId] = useState('');

  const phaseDuration = useMemo(() => {
    if (selectedMethod === 'card') {
      if (phase === 'initiating') return 1200;
      if (phase === 'processing') return 1600;
      if (phase === 'success') return 900;
      return 0;
    }

    if (phase === 'initiating') return 1500;
    if (phase === 'awaiting') return 1500;
    if (phase === 'processing') return 2000;
    if (phase === 'success') return 1000;
    return 0;
  }, [phase, selectedMethod]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCountdown(45);
      setTransactionId('');
      return;
    }

    if (phase === 'success' && !transactionId) {
      const id = drawTransactionId();
      setTransactionId(id);
      onTransactionReady(id);
    }
  }, [isOpen, phase, transactionId, onTransactionReady]);

  useEffect(() => {
    if (!isOpen || phase !== 'awaiting') return;

    setCountdown(45);
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOpen, phase]);

  useEffect(() => {
    if (!isOpen || !phaseDuration) return;

    setProgress(0);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.round((elapsed / phaseDuration) * 100));
      setProgress(pct);

      if (elapsed >= phaseDuration) {
        window.clearInterval(timer);
        onPhaseComplete();
      }
    }, 60);

    return () => window.clearInterval(timer);
  }, [isOpen, phase, phaseDuration, onPhaseComplete]);

  if (!isOpen || !phase) return null;

  return (
    <div className="payment-overlay fixed inset-0 z-[120] grid place-items-center bg-[#0b1020]/75 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#131a2b] text-white shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5 text-center">
          <div className="text-3xl">🍽️</div>
          <div className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">SmartCanteen Payments</div>
        </div>

        <div className="px-6 py-6 text-center">
          {phase === 'initiating' ? (
            <>
              <div className="text-2xl">🔐</div>
              <h3 className="mt-3 text-lg font-bold">Connecting to payment gateway...</h3>
              <AnimatedDots />
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : null}

          {phase === 'awaiting' ? (
            <>
              <div className="vibrate-phone mx-auto grid h-16 w-16 place-items-center rounded-full bg-yellow-400/20 text-3xl">📱</div>
              <h3 className="mt-3 text-lg font-bold">Check your {selectedUpi || 'UPI'} app</h3>
              <p className="mt-1 text-sm font-semibold text-yellow-300">Waiting for approval...</p>
              <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">paying to smartcanteen@upi</p>
              <p className="mt-3 text-sm text-white/75">Request expires in 0:{String(countdown).padStart(2, '0')}</p>
              <button
                type="button"
                onClick={onCancel}
                className="mt-4 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Cancel
              </button>
            </>
          ) : null}

          {phase === 'processing' ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-white/20 border-t-brand spin-loader" />
              <h3 className="mt-4 text-lg font-bold">Processing payment...</h3>
              <p className="mt-1 text-sm text-white/75">{formatMoney(amount)} is being verified</p>
            </>
          ) : null}

          {phase === 'success' ? (
            <>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20">
                <svg width="40" height="40" viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" fill="none" stroke="#22c55e" strokeWidth="3" />
                  <path
                    d="M14 27 L22 35 L38 19"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                    className="check-draw"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-bold text-emerald-300">Payment Successful! ✅</h3>
              <p className="mt-1 text-sm text-white/80">{formatMoney(amount)} paid</p>
              <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-slate-300">{transactionId}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;