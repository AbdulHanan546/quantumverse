import React from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const topics = [
    { title: "Quantum Entanglement", path: "/student/topic" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Hero title="Student Dashboard" subtitle="Explore your profile and topics." />

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Your Profile">
          <ul className="space-y-2 text-slate-300">
            <li>
              <span className="text-slate-400">Email:</span> {user?.email}
            </li>
            <li>
              <span className="text-slate-400">Role:</span>{" "}
              <span className="badge capitalize">{user?.role}</span>
            </li>
            <li>
              <span className="text-slate-400">ID:</span> {user?.id}
            </li>
          </ul>
        </Card>

        <Card title="Topics">
          <div className="flex flex-col gap-3">
            {topics.map((t) => (
              <button
                key={t.title}
                className="btn-primary w-full text-left"
                onClick={() => navigate(t.path)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

// Hero component
interface HeroProps {
  title: string;
  subtitle: string;
}

function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-green-400/20 p-8">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(600px_200px_at_20%_10%,rgba(16,185,129,0.2),transparent)]" />
      <h1 className="relative z-10 text-3xl md:text-4xl font-extrabold">{title}</h1>
      <p className="relative z-10 mt-3 text-slate-300/80">{subtitle}</p>
    </section>
  );
}

// Card component
interface CardProps {
  title: string;
  children: ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card rounded-2xl p-6 bg-gray-900/50 backdrop-blur-md shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
