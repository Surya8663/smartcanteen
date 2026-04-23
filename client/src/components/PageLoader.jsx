/**
 * Full page loading state component
 * Used with React.lazy and Suspense
 */

const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      {/* Logo */}
      <div className="mb-6 text-5xl">🍽️</div>

      {/* App Name */}
      <h1 className="text-2xl font-black text-navy mb-8">SmartCanteen</h1>

      {/* Spinner */}
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand animate-spin" />
      </div>

      {/* Loading Message */}
      <p className="text-slate-500 text-sm font-medium">Loading...</p>
    </div>
  );
};

export default PageLoader;
