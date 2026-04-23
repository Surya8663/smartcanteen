import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { usePortal } from '../context/PortalContext';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const qrRef = useRef(null);
  const { lastOrder } = usePortal();
  const [showConfetti, setShowConfetti] = useState(true);

  const order = location.state?.order || lastOrder;
  const earnedPoints = location.state?.earnedPoints ?? order?.pointsEarned ?? 0;

  useEffect(() => {
    if (!order) {
      navigate('/student/menu', { replace: true });
    }
    
    // Hide confetti after 3s
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [navigate, order]);

  const qrValue = useMemo(() => order?.qrPayload || '{}', [order]);

  const downloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${order.orderId}-qr.png`;
    link.click();
  };

  if (!order) {
    return null;
  }

  const confettiPieces = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="fixed w-2 h-2 pointer-events-none animate-confetti"
      style={{
        left: Math.random() * 100 + '%',
        backgroundColor: ['#FF6B35', '#1a1a2e', '#FFD700', '#00C4CC'][Math.floor(Math.random() * 4)],
        animation: `confetti ${Math.random() * 2 + 2}s ease-in forwards`,
        delay: Math.random() * 0.5 + 's'
      }}
    />
  ));

  return (
    <div className="page-enter">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiPieces}
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sm:p-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl animate-bounce">
            ✓
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Order Confirmed! 🎉</h1>
          <p className="mt-2 text-center text-gray-600">Your canteen order is locked and ready for pickup.</p>

          {/* Flying Points Animation */}
          {earnedPoints > 0 && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-ping text-3xl mb-3">
                +{earnedPoints} Points earned! ⭐
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Order ID</span>
                  <span className="font-semibold text-orange-600">{order.orderId?.slice(0, 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Slot</span>
                  <span className="font-semibold text-gray-900">{order.pickupSlot}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold text-gray-700 uppercase">Items ({order.items.length})</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between p-2 bg-white rounded border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty {item.qty}</p>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.subtotal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-75">QR Code</p>
              <p className="mt-2 text-xs opacity-90">Show at counter for quick pickup</p>
              <div className="mt-4 bg-white p-3 rounded-lg">
                <QRCodeCanvas ref={qrRef} value={qrValue} size={200} includeMargin />
              </div>
              <button
                type="button"
                onClick={downloadQr}
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                ⬇️ Download QR
              </button>
              {earnedPoints > 0 && (
                <div className="mt-3 bg-yellow-100/20 border border-yellow-300/50 px-4 py-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-yellow-300">+{earnedPoints} 🌟</p>
                  <p className="text-xs opacity-90">Points earned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/student/orders"
              className="rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-3 text-center text-sm font-semibold text-white transition"
            >
              View My Orders
            </Link>
            <Link
              to="/student/menu"
              className="rounded-lg border border-gray-300 hover:border-orange-500 px-6 py-3 text-center text-sm font-semibold text-gray-900 hover:text-orange-600 transition"
            >
              Back to Menu
            </Link>
            <Link
              to="/student/leaderboard"
              className="rounded-lg bg-purple-500 hover:bg-purple-600 px-6 py-3 text-center text-sm font-semibold text-white transition"
            >
              👑 Check Ranking
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translate3d(0, 0, 0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(100px, 500px, 0) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessPage;
