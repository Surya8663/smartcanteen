import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  const mockLeaderboard = [
    { rank: 1, username: 'rahul_2021', points: 340, ordersCount: 68, badge: '🏆 Canteen Champion' },
    { rank: 2, username: 'priya_cs', points: 285, ordersCount: 57, badge: '🥈 Regular' },
    { rank: 3, username: 'arjun_mech', points: 220, ordersCount: 44, badge: '🥉 Loyal Customer' },
    { rank: 4, username: 'sneha_ece', points: 195, ordersCount: 39, badge: '' },
    { rank: 5, username: 'karthik_it', points: 180, ordersCount: 36, badge: '' },
    { rank: 6, username: 'divya_civil', points: 165, ordersCount: 33, badge: '' },
    { rank: 7, username: 'rohan_bio', points: 150, ordersCount: 30, badge: '' },
    { rank: 8, username: 'anjali_chem', points: 140, ordersCount: 28, badge: '' },
    { rank: 9, username: 'vikram_ee', points: 125, ordersCount: 25, badge: '' },
    { rank: 10, username: 'neha_phys', points: 110, ordersCount: 22, badge: '' }
  ];

  useEffect(() => {
    const userPoints = JSON.parse(localStorage.getItem('sc_points') || '{"total": 0}').total;
    const userOrders = JSON.parse(localStorage.getItem('sc_orders') || '[]').length;
    
    let board = [...mockLeaderboard];
    const userEntry = {
      rank: null,
      username: user?.username || 'You',
      points: userPoints,
      ordersCount: userOrders,
      badge: userPoints >= 100 ? '🌟 Legend' : userPoints >= 50 ? '💫 Star' : ''
    };

    // Insert user in correct position
    board = board.filter(u => u.username !== user?.username);
    board.push(userEntry);
    board = board.sort((a, b) => b.points - a.points);
    board = board.map((u, idx) => ({ ...u, rank: idx + 1 }));

    setLeaderboard(board);
    setUserRank(board.find(u => u.username === (user?.username || 'You'))?.rank);
  }, [user]);

  const handleRefresh = () => {
    const board = [...mockLeaderboard].sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
    setLeaderboard(board);
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="p-6 pb-24 md:pb-6 space-y-6 page-enter">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <button
          onClick={handleRefresh}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Your Position Banner */}
      {userRank && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
          <p className="text-orange-900 font-bold text-lg">
            Your Position: #{userRank} with {leaderboard.find(u => u.username === (user?.username || 'You'))?.points || 0} points
          </p>
        </div>
      )}

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 md:items-end">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center animate-pulse-slow transform md:translate-y-8">
            <p className="text-sm text-gray-600 font-medium">2nd Place</p>
            <p className="text-4xl font-bold text-gray-400 mt-2">🥈</p>
            <p className="font-bold text-gray-900 mt-2">{top3[1].username}</p>
            <p className="text-lg font-bold text-gray-700">{top3[1].points} pts</p>
            <p className="text-xs text-gray-600">{top3[1].ordersCount} orders</p>
          </div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <div className="bg-white border-4 border-yellow-400 rounded-lg p-6 text-center shadow-lg">
            <p className="text-sm text-yellow-600 font-bold uppercase">🏆 Champion</p>
            <p className="text-6xl font-bold text-yellow-500 mt-2">🥇</p>
            <p className="font-bold text-gray-900 mt-3 text-lg">{top3[0].username}</p>
            <p className="text-2xl font-bold text-yellow-600">{top3[0].points} pts</p>
            <p className="text-sm text-gray-600 mt-1">{top3[0].ordersCount} orders</p>
            {top3[0].badge && <p className="text-sm mt-2">{top3[0].badge}</p>}
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="bg-white border-2 border-orange-400 rounded-lg p-4 text-center animate-pulse-slow transform md:translate-y-8">
            <p className="text-sm text-orange-600 font-medium">3rd Place</p>
            <p className="text-4xl font-bold text-orange-400 mt-2">🥉</p>
            <p className="font-bold text-gray-900 mt-2">{top3[2].username}</p>
            <p className="text-lg font-bold text-gray-700">{top3[2].points} pts</p>
            <p className="text-xs text-gray-600">{top3[2].ordersCount} orders</p>
          </div>
        )}
      </div>

      {/* Rankings 4-10 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {rest.map((entry, idx) => (
            <div
              key={idx}
              className={`p-4 flex items-center justify-between ${
                entry.username === (user?.username || 'You') ? 'bg-orange-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-orange-50 transition`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-xl font-bold text-gray-600 w-8">{entry.rank}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {entry.username === (user?.username || 'You') ? '👤 ' : ''}{entry.username}
                  </p>
                  {entry.badge && <p className="text-xs text-gray-600 mt-1">{entry.badge}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 text-xs">Points</p>
                    <p className="font-bold text-orange-600 text-lg">{entry.points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-xs">Orders</p>
                    <p className="font-bold text-gray-900">{entry.ordersCount}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 font-medium mb-2">📊 How Ranking Works</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Earn points with every order (based on amount spent)</li>
          <li>• Top 3 get badges: 🏆, 🥈, 🥉</li>
          <li>• 100+ points → 🌟 Legend status</li>
          <li>• Rankings update in real-time</li>
        </ul>
      </div>
    </div>
  );
}
