import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { callClaudeSafe } from '../utils/claudeApi';
import PaymentModal from '../components/PaymentModal';
import TicketModal from '../components/TicketModal';

const checkoutSlots = [
  { id: 's1', label: '12:00 PM – 12:15 PM', crowdLevel: 'low', orders: 6 },
  { id: 's2', label: '12:15 PM – 12:30 PM', crowdLevel: 'medium', orders: 18 },
  { id: 's3', label: '12:30 PM – 12:45 PM', crowdLevel: 'medium', orders: 24 },
  { id: 's4', label: '12:45 PM – 1:00 PM', crowdLevel: 'high', orders: 38 },
  { id: 's5', label: '1:00 PM – 1:15 PM', crowdLevel: 'medium', orders: 21 },
  { id: 's6', label: '1:15 PM – 1:30 PM', crowdLevel: 'low', orders: 9 }
];

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'wallet', label: 'Wallet', icon: '👛' }
];

const upiApps = ['GPay', 'PhonePe', 'Paytm', 'BHIM'];

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const toMinutes = (slotLabel) => {
  const [time, meridian] = slotLabel.trim().split(' ');
  let [hour, minute] = time.split(':').map(Number);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const parseSlotEnd = (label) => {
  const parts = label.split('–');
  return toMinutes(parts[1].trim());
};

const getWaitTime = (level) => {
  if (level === 'high') return '~22 min';
  if (level === 'medium') return '~12 min';
  return '~5 min';
};

const getCrowdBadge = (level) => {
  if (level === 'high') return { label: '🔴 Very crowded', tone: 'bg-red-100 text-red-700', helper: 'Very crowded' };
  if (level === 'medium') return { label: '🟡 Medium', tone: 'bg-yellow-100 text-yellow-700', helper: 'Moderately busy' };
  return { label: '🟢 Low', tone: 'bg-emerald-100 text-emerald-700', helper: 'Best time!' };
};

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const generateTxnId = () => `TXN${Math.floor(100000000000 + Math.random() * 900000000000)}`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, createOrder } = usePortal();

  const [selectedPickupSlot, setSelectedPickupSlot] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedUpi, setSelectedUpi] = useState('GPay');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/27');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('STUDENT NAME');

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cart]
  );
  const gst = useMemo(() => subtotal * 0.05, [subtotal]);
  const discount = useMemo(() => (promoApplied ? subtotal * 0.1 : 0), [promoApplied, subtotal]);
  const totalAmount = useMemo(() => Math.max(0, subtotal + gst - discount), [subtotal, gst, discount]);

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const slotData = useMemo(
    () =>
      checkoutSlots.map((slot) => ({
        ...slot,
        waitTime: getWaitTime(slot.crowdLevel),
        isPast: nowMinutes >= parseSlotEnd(slot.label),
        fillPercent: Math.min(100, Math.round((slot.orders / 50) * 100))
      })),
    [nowMinutes]
  );

  const recommendedSlot = useMemo(() => {
    const candidates = slotData.filter((slot) => !slot.isPast);
    if (!candidates.length) return slotData[slotData.length - 1];
    return candidates.reduce((min, slot) => (slot.orders < min.orders ? slot : min), candidates[0]);
  }, [slotData]);

  const selectedSlot = useMemo(
    () => slotData.find((slot) => slot.id === selectedPickupSlot) || null,
    [slotData, selectedPickupSlot]
  );

  useEffect(() => {
    if (!selectedPickupSlot && recommendedSlot) {
      setSelectedPickupSlot(recommendedSlot.id);
    }
  }, [recommendedSlot, selectedPickupSlot]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/student/menu', { replace: true });
    }
  }, [cart.length, navigate]);

  const fetchAiRecommendation = useCallback(async () => {
    setAiLoading(true);
    try {
      const prompt = `You are helping college students choose pickup slots.
Current slots:\n${JSON.stringify(slotData.map((s) => ({ slot: s.label, orders: s.orders, crowdLevel: s.crowdLevel })))}
Order total: ${formatMoney(totalAmount)}.
Recommend best slot as JSON only:
{"recommendedSlot":"...","reason":"...","waitTime":"...","tip":"..."}`;

      const response = await callClaudeSafe(prompt, {
        recommendedSlot: recommendedSlot?.label,
        reason: 'Lowest crowd slot selected for faster pickup.',
        waitTime: recommendedSlot?.waitTime || '~5 min',
        tip: 'Arrive 3-4 minutes before your slot to skip queues.'
      });

      setAiRecommendation(response);
      const aiSlot = slotData.find((slot) => slot.label === response.recommendedSlot && !slot.isPast);
      if (aiSlot) {
        setSelectedPickupSlot(aiSlot.id);
      }
    } catch {
      setAiRecommendation(null);
    } finally {
      setAiLoading(false);
    }
  }, [slotData, totalAmount, recommendedSlot]);

  useEffect(() => {
    if (cart.length > 0) {
      fetchAiRecommendation();
    }
  }, [cart.length, fetchAiRecommendation]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'STUDENT10') {
      setPromoApplied(true);
    }
  };

  const handlePhaseAdvance = () => {
    if (!paymentPhase) return;

    if (selectedPayment === 'card') {
      if (paymentPhase === 'initiating') {
        setPaymentPhase('processing');
        return;
      }
      if (paymentPhase === 'processing') {
        setPaymentPhase('success');
        return;
      }
      if (paymentPhase === 'success') {
        setPaymentPhase('ticket');
      }
      return;
    }

    if (paymentPhase === 'initiating') {
      setPaymentPhase('awaiting');
      return;
    }
    if (paymentPhase === 'awaiting') {
      setPaymentPhase('processing');
      return;
    }
    if (paymentPhase === 'processing') {
      setPaymentPhase('success');
      return;
    }
    if (paymentPhase === 'success') {
      setPaymentPhase('ticket');
    }
  };

  useEffect(() => {
    if (paymentPhase !== 'processing' || completedOrder) return;

    const slot = selectedSlot || recommendedSlot;
    const { order } = createOrder({
      pickupSlot: slot?.label || '12:00 PM – 12:15 PM',
      paymentMethod: selectedPayment
    });

    const enriched = {
      ...order,
      subtotal,
      gst,
      discount,
      totalAmount,
      crowdLevel: slot?.crowdLevel || 'low',
      waitTime: slot?.waitTime || '~5 min',
      estimatedPeople: slot?.orders || 0,
      recommendation:
        aiRecommendation?.reason || `Recommended slot: ${slot?.label || '12:00 PM – 12:15 PM'}`,
      transactionId
    };

    setCompletedOrder(enriched);
  }, [
    paymentPhase,
    completedOrder,
    createOrder,
    selectedSlot,
    recommendedSlot,
    selectedPayment,
    subtotal,
    gst,
    discount,
    totalAmount,
    aiRecommendation,
    transactionId
  ]);

  const handleConfirmPay = () => {
    if (!selectedSlot || selectedSlot.isPast) return;
    setCompletedOrder(null);
    setTransactionId(generateTxnId());
    setPaymentPhase('initiating');
  };

  const handleCancelPayment = () => {
    setPaymentPhase(null);
    setTransactionId('');
    setCompletedOrder(null);
  };

  const cardNetwork = cardNumber.replace(/\s/g, '').startsWith('4') ? 'VISA' : 'MASTERCARD';

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-navy">Review, Pay, and Get Your QR Ticket</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-navy">Your Order 🛒</h2>
              <Link to="/student/menu" className="text-sm font-semibold text-brand hover:text-brand/80">← Modify order</Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-navy">{item.name}</div>
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Qty {item.quantity}</span>
                  </div>
                  <div className="font-bold text-navy">{formatMoney(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>GST (5%)</span>
                <span>{formatMoney(gst)}</span>
              </div>
              {promoApplied ? (
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-600">
                  <span>Discount (STUDENT10)</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              ) : null}
              <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between text-lg font-black text-navy">
                <span>Total</span>
                <div className="text-right">
                  {promoApplied ? <div className="text-xs font-semibold text-slate-400 line-through">{formatMoney(subtotal + gst)}</div> : null}
                  <div>{formatMoney(totalAmount)}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Promo code"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand"
              >
                Apply
              </button>
            </div>
            {promoApplied ? <p className="mt-2 text-sm font-semibold text-emerald-600">✓ 10% discount applied!</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-navy">Choose Pickup Slot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {slotData.map((slot) => {
                const active = selectedPickupSlot === slot.id;
                const badge = getCrowdBadge(slot.crowdLevel);
                const aiPick = recommendedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => !slot.isPast && setSelectedPickupSlot(slot.id)}
                    disabled={slot.isPast}
                    className={`relative rounded-xl border p-4 text-left transition ${
                      active ? 'border-brand bg-brand/10 shadow-md' : 'border-slate-200 bg-white hover:border-brand/40'
                    } ${slot.isPast ? 'cursor-not-allowed opacity-45' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-black text-navy">{slot.label}</div>
                      <div className="flex items-center gap-2">
                        {aiPick ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">✨ AI Pick</span> : null}
                        {active ? <span className="text-brand text-lg">✓</span> : null}
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${slot.fillPercent}%` }} />
                    </div>

                    <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.tone}`}>{badge.label} • {badge.helper}</div>
                    <div className="mt-2 text-xs text-slate-600">~{slot.orders} people expected</div>
                    <div className="mt-1 text-xs font-semibold text-slate-700">{slot.waitTime}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-blue-900">✨ AI Recommendation</h3>
              <button type="button" onClick={fetchAiRecommendation} className="text-xs font-semibold text-blue-700 hover:text-blue-900">Refresh</button>
            </div>
            {aiLoading ? (
              <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-blue-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-blue-200 animate-pulse" />
              </div>
            ) : aiRecommendation ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="font-bold text-blue-900">{aiRecommendation.recommendedSlot || recommendedSlot?.label}</div>
                <div className="text-blue-800">{aiRecommendation.reason || 'Lowest queue slot selected by AI.'}</div>
                <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">⏱️ {aiRecommendation.waitTime || recommendedSlot?.waitTime}</div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-blue-700">Unable to fetch recommendation now.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-navy">Payment Method</h2>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPayment(method.id)}
                  className={`relative rounded-xl border p-3 text-center transition ${
                    selectedPayment === method.id ? 'border-brand bg-brand/10' : 'border-slate-200 hover:border-brand/40'
                  }`}
                >
                  {selectedPayment === method.id ? <span className="absolute right-2 top-2 text-brand text-sm">✓</span> : null}
                  <div className="text-2xl">{method.icon}</div>
                  <div className="mt-1 text-sm font-semibold text-navy">{method.label}</div>
                </button>
              ))}
            </div>

            {selectedPayment === 'upi' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {upiApps.map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setSelectedUpi(app)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedUpi === app ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            ) : null}

            {selectedPayment === 'card' ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                    <span>💳 SMARTCANTEEN</span>
                    <span>{cardNetwork}</span>
                  </div>
                  <div className="mt-5 text-xl font-mono tracking-[0.2em]">{cardNumber || '#### #### #### ####'}</div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span>{cardName || 'STUDENT NAME'}</span>
                    <span>{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>

                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  placeholder="Card number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value.slice(0, 5))}
                    placeholder="MM/YY"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={cardCvv}
                    onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="CVV"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
                <input
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value.toUpperCase())}
                  placeholder="Name on card"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>
            ) : null}

            <button
              type="button"
              disabled={!selectedSlot || selectedSlot.isPast || Boolean(paymentPhase)}
              onClick={handleConfirmPay}
              className="mt-6 w-full rounded-xl bg-brand px-5 py-4 text-base font-bold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirm & Pay {formatMoney(totalAmount)}
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={Boolean(paymentPhase && paymentPhase !== 'ticket')}
        phase={paymentPhase}
        amount={totalAmount}
        selectedMethod={selectedPayment}
        selectedUpi={selectedUpi}
        onCancel={handleCancelPayment}
        onPhaseComplete={handlePhaseAdvance}
        onTransactionReady={(id) => setTransactionId(id)}
      />

      <TicketModal
        isOpen={paymentPhase === 'ticket' && Boolean(completedOrder)}
        order={completedOrder}
        onClose={() => {
          setPaymentPhase(null);
          setCompletedOrder(null);
        }}
      />
    </section>
  );
};

export default CheckoutPage;
