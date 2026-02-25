import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import Loading from '../components/Loading';
import DifficultyTag from '../components/DifficultyTag';

export default function ConceptDetail() {
  const { id } = useParams();
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getConcept(id);
        setConcept(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <Loading />;
  if (!concept) return <div className="text-center py-20 text-gray-400">Concept not found</div>;

  // Simple markdown-like rendering for content
  function renderContent(text) {
    return text.split('\n\n').map((block, i) => {
      if (block.startsWith('**') && block.endsWith('**')) {
        return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{block.replace(/\*\*/g, '')}</h3>;
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter(l => l.startsWith('- '));
        return (
          <ul key={i} className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-2 mb-3">
            {items.map((item, j) => (
              <li key={j}>{renderInline(item.slice(2))}</li>
            ))}
          </ul>
        );
      }
      // Check for bold headings within paragraph
      if (block.includes('**')) {
        return <p key={i} className="text-sm text-gray-300 leading-relaxed mb-3">{renderInline(block)}</p>;
      }
      return <p key={i} className="text-sm text-gray-300 leading-relaxed mb-3">{block}</p>;
    });
  }

  function renderInline(text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/concepts" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
        ← Back to Concepts
      </Link>

      <div className="card-surface p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-white">{concept.title}</h1>
          <DifficultyTag difficulty={concept.difficulty} />
        </div>
        <div className="flex gap-2 mb-6">
          <span className="tag bg-felt-700 text-gray-400">{concept.category}</span>
        </div>

        <p className="text-gray-400 mb-6 leading-relaxed">{concept.shortDescription}</p>

        <div className="border-t border-felt-600/30 pt-6">
          {renderContent(concept.content)}
        </div>
      </div>

      {/* Example Hand */}
      <div className="card-surface p-6 border-l-4 border-accent-green">
        <h3 className="text-base font-semibold text-white mb-2">Example Hand</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{concept.exampleHand}</p>
      </div>

      {/* Key Takeaways */}
      <div className="card-surface p-6 border-l-4 border-accent-gold">
        <h3 className="text-base font-semibold text-white mb-3">Key Takeaways</h3>
        <ul className="space-y-2">
          {concept.keyTakeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-accent-gold mt-0.5">•</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
