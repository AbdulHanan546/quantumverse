import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { FeynmanMethod } from './components/FeynmanMethod';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { useState } from 'react';
import { AuthDialog } from './components/AuthDialog';
import "./index.css";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      <Hero onOpenAuth={() => setIsAuthOpen(true)} />
      <Features />
      <HowItWorks />
      <FeynmanMethod />
      <CTA onOpenAuth={() => setIsAuthOpen(true)} />
      <Footer />
      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}