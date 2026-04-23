import React, { useState, useEffect } from 'react';

export default function NoticeBoard() {
  const [notice, setNotice] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('sc_settings') || '{}');
    const notice_text = settings.canteenNotice || '';
    const isDismissed = sessionStorage.getItem('notice_dismissed') === 'true';
    
    setNotice(notice_text);
    setDismissed(isDismissed);
  }, []);

  if (!notice || dismissed) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📢</span>
        <p className="text-orange-900 font-medium text-sm">{notice}</p>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('notice_dismissed', 'true');
        }}
        className="text-orange-600 hover:text-orange-800 text-xl font-bold ml-4 flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}
