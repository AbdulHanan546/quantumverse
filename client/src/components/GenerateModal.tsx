import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSlides } from '../api/generation';
import type { SlideData } from './TopicRenderer';
import Spinner from './Spinner';

interface GenerateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GenerateModal({
  open,
  onClose,
}: GenerateModalProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [hints, setHints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
  if (!prompt.trim()) {
    setError('Please enter a prompt');
    return;
  }

  if (prompt.trim().length < 3) {
    setError('Prompt must be at least 3 characters');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const rawSlides: any[] = await generateSlides(prompt, hints || undefined);

    // Navigate to topic viewer with raw slides (they will be adapted on the viewer page)
    navigate('/topic/generated-slides', {
      state: {
        components: rawSlides,
        isGenerated: true,
        topicTitle: prompt,
      },
      replace: false,
    });

    // Reset form and close
    setPrompt('');
    setHints('');
    onClose();
  } catch (err:  any) {
    console.error('Generation error:', err);
    setError(
      err. response?.data?.message ||
        'Failed to generate slides. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-green-400/30 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-300">Generate Slides</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              What would you like to learn about? *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Explain quantum entanglement for beginners, or create slides about photosynthesis"
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-800 border border-green-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400 disabled:opacity-50 resize-none"
              rows={5}
            />
            {prompt.length > 0 && prompt.length < 3 && (
              <p className="text-xs text-red-400 mt-1">
                At least 3 characters required
              </p>
            )}
          </div>

          {/* Hints Input */}
          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Additional Hints (Optional)
            </label>
            <textarea
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              placeholder="e.g., Use analogies, keep it simple, include examples"
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-800 border border-green-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400 disabled:opacity-50 resize-none"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <Spinner />
              <p className="text-green-300 text-sm mt-2">Generating slides...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-green-400/20">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded hover:border-gray-400 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
