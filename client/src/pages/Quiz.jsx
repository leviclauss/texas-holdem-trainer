import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import { api } from '../api';
import Loading from '../components/Loading';
import ScenarioDisplay from '../components/ScenarioDisplay';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = ['All', 'Preflop', 'Flop', 'Turn', 'River', 'Bluff Catch', '3-Bet Pots'];

export default function Quiz() {
  const { user, refreshUser } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [answeredIds, setAnsweredIds] = useState(new Set());

  useEffect(() => {
    loadScenarios();
  }, [difficulty, category]);

  async function loadScenarios() {
    setLoading(true);
    try {
      const params = {};
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (category !== 'All') params.category = category;
      const data = await api.getScenarios(params);
      setScenarios(data);
      pickRandom(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function pickRandom(pool) {
    const available = pool.filter(s => !answeredIds.has(s.id));
    const source = available.length > 0 ? available : pool;
    const idx = Math.floor(Math.random() * source.length);
    setCurrent(source[idx]);
    setResult(null);
    setShowResult(false);
  }

  async function handleAnswer(answer) {
    if (!user || !current) return;
    try {
      const res = await api.submitQuiz(user.id, current.id, answer);
      setResult(res);
      setShowResult(true);
      setAnsweredIds(prev => new Set(prev).add(current.id));
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  }

  function handleNext() {
    pickRandom(scenarios);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Spot Quiz</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="bg-felt-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-felt-600 focus:outline-none focus:border-accent-green"
          >
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-felt-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-felt-600 focus:outline-none focus:border-accent-green"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {current ? (
        <div className="card-surface p-6">
          <ScenarioDisplay
            scenario={current}
            onAnswer={handleAnswer}
            result={result}
            showResult={showResult}
          />
          {showResult && (
            <button onClick={handleNext} className="btn-primary mt-6">
              Next Hand →
            </button>
          )}
        </div>
      ) : (
        <div className="card-surface p-12 text-center text-gray-400">
          No scenarios found for the selected filters.
        </div>
      )}
    </div>
  );
}
