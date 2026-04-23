import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { usePortal } from '../context/PortalContext';

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const getCrowdBadge = (level) => {
  if (level === 'high') return '🔴 High Crowd';
  if (level === 'medium') return '🟡 Medium Crowd';
  return '🟢 Low Crowd';
};

const TicketModal = ({ isOpen, order, onClose }) => {
  const navigate = useNavigate();
  const { clearCart } = usePortal();

  const shareText = useMemo(() => {
    if (!order) return '';
    return `Order #${order.orderId || 'SC-0000'} confirmed for ${order.pickupSlot || '12:00 PM – 12:15 PM'}`;
  }, [order]);

  if (!isOpen || !order) return null;

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    const payload = {
      title: 'My SmartCanteen Order',
      text: shareText
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(payload.text);
      }
    } catch {
      // User cancelled share dialog
    }
  };

  const handleBackHome = () => {
    clearCart();
    onClose();
    navigate('/student/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-100/90 px-4 py-8 ticket-modal-bg">
      <div className="ticket-print-container relative w-full max-w-3xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className="confetti absolute h-2 w-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-10 - Math.random() * 20}%`,
                background: ['#ff6b35', '#facc15', '#22c55e', '#60a5fa'][index % 4],
                animationDelay: `${Math.random() * 0.8}s`
              }}
            />
          ))}
        </div>

        <div className="ticket-card relative overflow-hidden rounded-3xl bg-white shadow-2xl ticket-slide-up">
          <div className="bg-brand px-8 py-6 text-white">
            <div className="text-2xl font-black">🍽️ SMARTCANTEEN</div>
            <div className="text-sm font-semibold text-white/85">Digital Food Coupon</div>
          </div>

          <div className="px-8 py-6">
            <div className="text-lg font-black text-navy">ORDER #{order.orderId || 'SC-0000'}</div>
            <div className="mt-1 text-sm text-slate-500">{order.username || 'student'} • SmartCanteen Campus</div>

            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Items Ordered</div>
              <div className="mt-2 space-y-2">
                {(order.items || []).map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between text-sm text-slate-700">
                    <span>{item.name} × {item.qty}</span>
                    <span className="font-semibold">{formatMoney(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-3 text-right text-lg font-black text-navy">
                Total: {formatMoney(order.totalAmount)}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="font-semibold">📅 Today • 🕐 {order.pickupSlot || '12:00 PM – 12:15 PM'}</div>
              <div className="mt-1 text-slate-600">{getCrowdBadge(order.crowdLevel || 'low')} • {order.waitTime || '~5 min wait'}</div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_160px] sm:items-center">
              <div>
                <div className="text-sm font-bold text-navy">SHOW THIS QR AT COUNTER</div>
                <div className="mt-2 text-sm text-slate-600">+{order.pointsEarned || 0} pts earned <span className="inline-block points-star-bounce">🌟</span></div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                <QRCodeCanvas value={order.qrPayload || JSON.stringify({ orderId: order.orderId })} size={120} includeMargin />
              </div>
            </div>

            <div className="tear-line mt-6" />

            <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
              <div>Valid only for above slot</div>
              <div className="mt-1 font-mono">TXN: {order.transactionId || 'TXN000000000000'} • <span className="font-bold text-emerald-600">CONFIRMED</span></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand"
          >
            📥 Download Ticket
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand"
          >
            📤 Share
          </button>
          <button
            type="button"
            onClick={handleBackHome}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;