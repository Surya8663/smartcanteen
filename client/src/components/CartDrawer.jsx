import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cart, cartCount, isCartOpen, closeCart, updateCartQuantity, removeFromCart } = usePortal();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />

      <aside
        className={`fixed bottom-0 left-0 z-[70] h-[88vh] w-full rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[420px] md:rounded-none md:rounded-l-[2rem] ${
          isCartOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">
            <div>
              <div className="text-lg font-black text-navy">Cart</div>
              <div className="text-sm text-slate-500">{cartCount} item(s)</div>
            </div>
            <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600" onClick={closeCart}>
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6">
            {cart.length === 0 ? (
              <div className="grid h-full place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div>
                  <div className="text-4xl">🛒</div>
                  <div className="mt-3 text-lg font-bold text-navy">Your cart is empty</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Add some canteen favorites to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex gap-3">
                      <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-navy">{item.name}</div>
                            <div className="text-xs text-slate-500">₹{item.price} each</div>
                          </div>
                          <button className="text-sm font-semibold text-slate-400 hover:text-brand" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                            <button
                              className="grid h-8 w-8 place-items-center rounded-full bg-white font-bold text-navy shadow-sm"
                              onClick={() => updateCartQuantity(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-navy">{item.quantity}</span>
                            <button
                              className="grid h-8 w-8 place-items-center rounded-full bg-white font-bold text-navy shadow-sm"
                              onClick={() => updateCartQuantity(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="font-bold text-navy">₹{item.price * item.quantity}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-5 py-4 md:px-6">
            <div className="flex items-center justify-between text-lg font-black text-navy">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              className="mt-4 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={cart.length === 0}
              onClick={() => {
                closeCart();
                navigate('/student/checkout');
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
