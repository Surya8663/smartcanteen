import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fffaf7_100%)] text-navy">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            Admin Dashboard
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome, {user?.username || 'admin'}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            This is the admin placeholder view for SmartCanteen. The next phase will plug in menu management, order
            control, analytics, and live crowd monitoring.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Menu control', 'Add, edit, and remove items'],
              ['Order oversight', 'Review student orders and status'],
              ['Analytics', 'Track demand and canteen traffic']
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl bg-slate-50 p-5">
                <div className="font-bold text-navy">{title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
