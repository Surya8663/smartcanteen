import { useEffect, useMemo, useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { menuItems } from '../data/mockData';
import { readJSON, writeJSON } from '../utils/storage';
import { callClaude } from '../utils/claudeApi';

const categories = ['All', 'Meals', 'Snacks', 'Beverages', 'Desserts'];

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [useAiSearch, setUseAiSearch] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiReason, setAiReason] = useState('');
  const [aiError, setAiError] = useState(false);
  const { cart, addToCart, updateCartQuantity } = usePortal();

  useEffect(() => {
    const fromStorage = readJSON('sc_menu', null);

    if (!fromStorage || !Array.isArray(fromStorage) || fromStorage.length === 0) {
      const initialized = menuItems.map((item) => ({
        ...item,
        totalQuantity: item.totalQuantity || item.remainingQuantity
      }));
      writeJSON('sc_menu', initialized);
      setMenuData(initialized);
      return;
    }

    setMenuData(fromStorage);
  }, []);

  const fetchAiSearch = async () => {
    if (!search.trim()) return;
    
    setAiLoading(true);
    setAiError(false);
    try {
      const menuText = menuData.map(m => `- ${m.name}: ₹${m.price}, ${m.description}, Category: ${m.category}`).join('\n');
      const prompt = `You are a food recommendation assistant for a canteen menu. User request: "${search}". 

Menu items:
${menuText}

Find the best matching items that fulfill the user's request. Return ONLY valid JSON (no markdown):
{
  "matches": [{"name": "item name", "reason": "why this matches"}],
  "overallReason": "brief explanation of your recommendations",
  "tip": "helpful tip for the user"
}`;

      const response = await callClaude(prompt);
      const matchIds = menuData
        .filter(item => response.matches?.some(m => m.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(m.name.toLowerCase())))
        .map(item => item.id);
      
      setAiMatches(matchIds);
      setAiReason(response.overallReason || 'AI recommendation');
    } catch (error) {
      console.error('AI search failed:', error);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let items = menuData;

    if (useAiSearch && aiMatches.length > 0) {
      items = items.filter(item => aiMatches.includes(item.id));
    } else {
      items = items.filter((item) => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }

    return items;
  }, [activeCategory, search, menuData, useAiSearch, aiMatches]);

  const getCartItem = (id) => cart.find((item) => item.id === id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Menu</p>
          <h1 className="mt-2 text-3xl font-black text-navy sm:text-4xl">What would you like to eat?</h1>
        </div>
        <div className="flex max-w-md flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && useAiSearch && !aiLoading) {
                  fetchAiSearch();
                }
              }}
              placeholder={useAiSearch ? "e.g., 'spicy under ₹60'..." : 'Search by item name...'}
              className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-navy outline-none transition focus:border-brand"
            />
            {useAiSearch && (
              <button
                type="button"
                onClick={fetchAiSearch}
                disabled={aiLoading || !search.trim()}
                className="rounded-full bg-brand px-4 py-3 text-white font-semibold transition hover:bg-brand/90 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {aiLoading ? '⏳' : '🔍'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setUseAiSearch(!useAiSearch);
              setAiMatches([]);
              setSearch('');
              setAiError(false);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              useAiSearch 
                ? 'bg-brand text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {useAiSearch ? '🤖 AI Search' : '🔍 Regular Search'}
          </button>
        </div>
      </div>

      {useAiSearch && aiMatches.length > 0 && aiReason && !aiLoading && (
        <div className="mb-6 rounded-2xl border-l-4 border-brand bg-orange-50 p-4">
          <p className="text-sm text-slate-700"><span className="font-semibold text-brand">AI Pick:</span> <i>{aiReason}</i></p>
          <p className="mt-2 text-xs text-slate-500">Powered by Claude AI ✨</p>
        </div>
      )}

      {useAiSearch && aiError && (
        <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
          <p className="text-sm text-red-700">AI search failed. Showing all items instead.</p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        {!useAiSearch && categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition hover:scale-105 ${
              activeCategory === category ? 'bg-brand text-white shadow-md' : 'bg-white text-slate-600 shadow-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const cartItem = getCartItem(item.id);
          const isAiPick = useAiSearch && aiMatches.includes(item.id);
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl">
              <div className="relative h-52 w-full overflow-hidden bg-slate-200">
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                {isAiPick && (
                  <div className="absolute top-3 right-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-md">
                    🤖 AI Pick
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-navy">{item.name}</h2>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xl font-black text-brand">₹{item.price}</div>
                </div>

                <p className="mt-4 min-h-14 text-sm leading-6 text-slate-500">{item.description}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                  <span className={`text-xs font-semibold ${item.remainingQuantity < 10 ? 'text-red-600' : 'text-slate-500'}`}>
                    {item.remainingQuantity < 10 ? `Only ${item.remainingQuantity} left!` : `${item.remainingQuantity} left in stock`}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  {cartItem ? (
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white font-black text-navy shadow-sm" onClick={() => updateCartQuantity(item.id, -1)}>
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-navy">{cartItem.quantity}</span>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white font-black text-navy shadow-sm" onClick={() => updateCartQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      onClick={() => addToCart(item)}
                      className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Add to Cart
                    </button>
                  )}
                  {cartItem ? <span className="text-sm font-semibold text-brand">Added</span> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="text-5xl">🍽️</div>
          <h2 className="mt-4 text-2xl font-black text-navy">No items found</h2>
          <p className="mt-2 text-sm text-slate-500">
            {useAiSearch ? 'Try a different AI search query.' : 'Try a different search term or switch category tabs.'}
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default MenuPage;
