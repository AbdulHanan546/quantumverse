import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopicRenderer from '../components/TopicRenderer';
import adaptGeneratedSlides from '../utils/adaptGeneratedSlides';

export default function GeneratedSlidesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { components?: any[]; isGenerated?: boolean } | null;

  const rawSlides = state?.components ?? [];
  const slides = adaptGeneratedSlides(rawSlides);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400">
        <h3 className="text-2xl mb-4">No generated slides found</h3>
        <p className="mb-6">Go back and generate slides first.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-green-600 rounded">Go back</button>
      </div>
    );
  }

  return <TopicRenderer slides={slides} />;
}
