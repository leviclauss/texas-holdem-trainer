import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Loading from '../components/Loading';
import DifficultyTag from '../components/DifficultyTag';

export default function Concepts() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getConcepts();
        setConcepts(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loading />;

  const categories = ['All', ...new Set(concepts.map(c => c.category))];
  const filtered = filter === 'All' ? concepts : concepts.filter(c => c.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Concept Library</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                filter === cat
                  ? 'bg-accent-green text-white'
                  : 'bg-felt-700 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(concept => (
          <Link
            key={concept.id}
            to={`/concepts/${concept.id}`}
            className="card-surface p-5 hover:border-accent-green/50 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-white group-hover:text-accent-gold transition-colors">
                {concept.title}
              </h3>
              <DifficultyTag difficulty={concept.difficulty} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
              {concept.shortDescription}
            </p>
            <div className="mt-3">
              <span className="tag bg-felt-700 text-gray-400">{concept.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
