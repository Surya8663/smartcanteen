import { Link } from 'react-router-dom';

/**
 * 404 Not Found page
 * Shown when user navigates to non-existent route
 */

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-6 space-y-2">
          <div className="text-9xl font-black text-brand">404</div>
          <div className="text-6xl">🍽️</div>
        </div>

        {/* Title & Message */}
        <h1 className="text-3xl font-black text-navy mb-2">
          Looks like this page went to lunch!
        </h1>
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-full transition hover:bg-brand/90 hover:scale-105"
        >
          🏠 Back to Home
        </Link>

        {/* Navigation Hints */}
        <div className="mt-12 space-y-2 text-sm text-slate-600">
          <p>Try navigating to:</p>
          <div className="flex flex-col gap-2">
            <Link to="/student/dashboard" className="text-brand hover:underline">
              📊 Student Dashboard
            </Link>
            <Link to="/student/menu" className="text-brand hover:underline">
              🍽️ Menu
            </Link>
            <Link to="/admin/dashboard" className="text-brand hover:underline">
              👨‍💼 Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
