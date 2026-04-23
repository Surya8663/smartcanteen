import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import TicketModal from '../components/TicketModal';

const inferCrowdFromSlot = (slotLabel) => {
  if (!slotLabel) return 'low';
  if (slotLabel.includes('12:45') || slotLabel.includes('1:00 PM')) return 'high';
  if (slotLabel.includes('12:15') || slotLabel.includes('12:30')) return 'medium';
  return 'low';
};

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, addToCart } = usePortal();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTicketOrder, setSelectedTicketOrder] = useState(null);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return sortedOrders;
    return sortedOrders.filter((order) => order.status?.toLowerCase() === activeFilter);
  }, [activeFilter, sortedOrders]);

  const handleReorder = (order) => {
    (order.items || []).forEach((item) => {
      const quantity = Number(item.qty || 1);
      for (let i = 0; i < quantity; i += 1) {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl
        });
      }
    });
    navigate('/student/menu');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:pb-8 lg:px-8 page-enter">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">Orders</p>
          <h1 className="mt-2 text-3xl font-black text-navy">My Orders</h1>
        </div>
        <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{orders.length} total</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'completed', label: 'Completed' }
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveFilter(pill.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === pill.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Latest first</span>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="text-7xl floating-empty-cart">🛒</div>
          <h2 className="mt-3 text-3xl font-black text-navy">No orders yet!</h2>
          <p className="mt-2 text-slate-600">Your canteen adventure starts here 🍽️</p>
          <Link
            to="/student/menu"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const crowdLevel = order.crowdLevel || inferCrowdFromSlot(order.pickupSlot || order.slot);
            const stripColor = order.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand';
            const statusTone =
              order.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-700'
                : order.status === 'Confirmed'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-700';

            return (
              <article key={order.orderId} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <span className={`absolute inset-y-0 left-0 w-1 ${stripColor}`} />
                <div className="grid gap-4 p-5 md:grid-cols-[1.4fr_0.6fr] md:items-center md:pl-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-navy">#{order.orderId}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{new Date(order.timestamp).toLocaleString()}</p>

                    <p className="mt-2 text-sm text-slate-700">
                      {(order.items || []).map((item) => `${item.name} ×${item.qty}`).join(', ')}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{order.pickupSlot || order.slot}</span>
                      <span className={`rounded-full px-3 py-1 font-semibold ${
                        crowdLevel === 'high'
                          ? 'bg-red-100 text-red-700'
                          : crowdLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {crowdLevel === 'high' ? '🔴 High crowd' : crowdLevel === 'medium' ? '🟡 Medium crowd' : '🟢 Low crowd'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-2xl font-black text-brand">{formatMoney(order.totalAmount)}</div>
                    <div className="mt-3 flex flex-wrap justify-start gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedTicketOrder(order)}
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand"
                      >
                        View Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <TicketModal
        isOpen={Boolean(selectedTicketOrder)}
        order={selectedTicketOrder}
        onClose={() => setSelectedTicketOrder(null)}
      />
    </section>
  );
};

export default MyOrdersPage;
