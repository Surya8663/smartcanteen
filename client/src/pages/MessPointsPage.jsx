import { useMemo, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { usePortal } from '../context/PortalContext';
import PointsRing from '../components/PointsRing';
import AchievementBadges from '../components/AchievementBadges';
import { Link } from 'react-router-dom';

const MessPointsPage = () => {
  const { user } = useAuth();
  const { points, redeemPoints, notify, orders } = usePortal();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemTimestamp, setRedeemTimestamp] = useState('');

  const qrValue = useMemo(
    () =>
      JSON.stringify({
        type: 'FREE_MEAL',
        username: user?.username || 'student',
        timestamp: redeemTimestamp || new Date().toISOString()
      }),
    [redeemTimestamp, user]
  );

  const handleRedeem = () => {
    const result = redeemPoints();
    if (!result) {
      notify('You need 100 points to redeem a free meal.', 'info');
      return;
    }

    setRedeemTimestamp(result);
    setShowRedeemModal(true);
  };

  return (
    <div className="page-enter">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Mess Points</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Rewards and redemption</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left: Points Ring & Redeem */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <PointsRing points={points.total} maxPoints={100} />

            {points.total >= 100 ? (
              <button
                type="button"
                onClick={handleRedeem}
                className="mt-6 w-full rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition"
              >
                🎁 Claim Free Meal!
              </button>
            ) : (
              <div className="mt-6 bg-orange-50 border border-orange-200 px-4 py-4 rounded-lg text-center">
                <p className="text-sm font-semibold text-orange-900">
                  {100 - points.total} more points to unlock free meal
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-200">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${points.total}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Right: History & Leaderboard */}
          <div className="space-y-6">
            {/* Points History */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Points History</h2>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {points.history.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No points history yet. Place an order to start earning!
                  </div>
                ) : (
                  points.history.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{entry.description}</p>
                        <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</p>
                      </div>
                      <p className={`font-bold text-sm ${entry.points > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Leaderboard Teaser */}
            <Link to="/student/leaderboard" className="block bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white hover:shadow-lg transition">
              <div className="text-sm font-semibold uppercase tracking-wider opacity-90">Leaderboard</div>
              <h3 className="text-xl font-bold mt-1">Climb the ranking chart</h3>
              <p className="text-sm opacity-90 mt-2">See how you compare → {orders.length} orders so far</p>
            </Link>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <AchievementBadges points={points.total} orderCount={orders.length} />
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📊 How Points Work</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• ₹20-49: 5 points | ₹50-99: 8 points | ₹100+: 12 points</li>
            <li>• 100 points = 1 free meal via QR code</li>
            <li>• Maintain a streak for bonus points</li>
            <li>• Top leaderboard members get special badges</li>
          </ul>
        </div>
      </section>

      {/* Redeem Modal */}
      {showRedeemModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 text-center shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">Congratulations!</h2>
            <p className="mt-2 text-gray-600 text-sm">You've claimed a free meal using 100 points</p>
            <div className="mt-6 bg-gray-100 p-4 rounded-lg inline-block">
              <QRCodeCanvas value={qrValue} size={180} includeMargin />
            </div>
            <div className="mt-4 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg inline-block font-bold text-sm">
              FREE MEAL VOUCHER
            </div>
            <button
              type="button"
              onClick={() => setShowRedeemModal(false)}
              className="mt-6 w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessPointsPage;
