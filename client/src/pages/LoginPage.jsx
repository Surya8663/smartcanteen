import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(username.trim(), password);
      const redirectPath = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      navigate(location.state?.from?.pathname || redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_35%),linear-gradient(180deg,#fff_0%,#fffaf7_100%)] px-4 py-10 text-navy sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[2rem] bg-navy p-10 text-white shadow-soft lg:block">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
            SmartCanteen Access
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight">Fast access for students and administrators.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">
            Sign in once, get a role-aware dashboard, and keep the campus canteen moving without the queue chaos.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ['Student view', 'Browse menu and order quickly'],
              ['Admin view', 'Track orders and manage menu'],
              ['QR coupons', 'Pickup-ready after payment'],
              ['Mess points', 'Reward loyal cafeteria usage']
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl bg-white/8 border border-white/10 p-5">
                <div className="font-bold">{title}</div>
                <div className="mt-1 text-sm leading-6 text-white/70">{description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl text-brand">
              🍽️
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-navy">Login to SmartCanteen</h2>
            <p className="mt-2 text-slate-500">Use any credentials for students or the admin combination below.</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-2">
            {['student', 'admin'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize transition-all duration-200 ${
                  selectedMode === mode ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-navy'
                }`}
              >
                Login as {mode}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedMode('student');
                setUsername('demo_student');
                setPassword('');
                setError('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
            >
              👨‍🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMode('admin');
                setUsername('admin');
                setPassword('12345678');
                setError('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
            >
              👨‍💼 Admin Demo
            </button>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={selectedMode === 'admin' ? 'admin' : 'your name or registration'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-navy outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={selectedMode === 'admin' ? '12345678' : 'any password'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-navy outline-none transition focus:border-brand focus:bg-white"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3.5 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Enter SmartCanteen'}
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            <strong className="text-navy">Admin login:</strong> username = <span className="font-semibold">admin</span>,
            password = <span className="font-semibold">12345678</span>.
            <br />
            All other combinations are treated as student access.
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
