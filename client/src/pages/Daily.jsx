import { useEffect, useState, useRef } from 'react';
import { useUser } from '../UserContext';
import { api } from '../api';
import Loading from '../components/Loading';
import ScenarioDisplay from '../components/ScenarioDisplay';

export default function Daily() {
  const { user, refreshUser } = useUser();
  const [daily, setDaily] = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [prevCompletion, setPrevCompletion] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [d, check] = await Promise.all([
          api.getDaily(),
          api.checkDaily(user.id),
        ]);
        setDaily(d);
        if (check.completed) {
          setAlreadyDone(true);
          setPrevCompletion(check.completion);
        }
        startCountdown(d.secondsRemaining);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  function startCountdown(seconds) {
    let remaining = seconds;
    updateCountdownDisplay(remaining);
    timerRef.current = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setCountdown('00:00:00');
        return;
      }
      updateCountdownDisplay(remaining);
    }, 1000);
  }

  function updateCountdownDisplay(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    setCountdown(`${h}:${m}:${s}`);
  }

  async function handleAnswer(answer) {
    if (!user || !daily) return;
    try {
      const res = await api.submitDaily(user.id, daily.scenario.id, answer, daily.date);
      setResult(res);
      setShowResult(true);
      refreshUser();
    } catch (err) {
      if (err.message.includes('Already completed')) {
        setAlreadyDone(true);
      }
      console.error(err);
    }
  }

  if (loading) return <Loading />;
  if (!daily) return <div className="text-center py-20 text-gray-400">Failed to load daily challenge</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
          <p className="text-gray-500 text-sm mt-1">{daily.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">Next challenge in</span>
          <span className="text-accent-gold font-mono font-semibold text-lg">{countdown}</span>
        </div>
      </div>

      {alreadyDone && !showResult ? (
        <div className="card-surface p-8 text-center">
          <div className="text-4xl mb-4">
            {prevCompletion?.is_correct ? '✓' : '✗'}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {prevCompletion?.is_correct ? 'You got it right!' : 'Better luck tomorrow!'}
          </h2>
          <p className="text-gray-400 mb-4">You've already completed today's challenge.</p>
          <div className="text-sm text-gray-500">
            Your answer: <span className="text-white font-medium">{prevCompletion?.user_answer}</span>
            {' | '}
            Correct: <span className="text-accent-gold font-medium">{prevCompletion?.correct_answer}</span>
          </div>

          {/* Community stats */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Community Results</h3>
            <div className="flex justify-center gap-4">
              {Object.entries(daily.communityStats).map(([opt, pct]) => (
                <div key={opt} className="text-center">
                  <div className="text-lg font-bold text-white">{pct}%</div>
                  <div className={`text-xs ${opt === daily.scenario.correctAnswer ? 'text-accent-gold font-medium' : 'text-gray-500'}`}>
                    {opt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-surface p-6">
          <ScenarioDisplay
            scenario={daily.scenario}
            onAnswer={handleAnswer}
            result={result}
            showResult={showResult}
          />

          {/* Community results after answering */}
          {showResult && result && (
            <div className="mt-6 p-4 bg-felt-700/30 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Community Results</h3>
              <div className="flex justify-center gap-6">
                {Object.entries(daily.communityStats).map(([opt, pct]) => (
                  <div key={opt} className="text-center">
                    <div className="w-full bg-felt-600/30 rounded-full h-20 flex flex-col justify-end relative overflow-hidden" style={{ width: '60px' }}>
                      <div
                        className={`rounded-full transition-all duration-700 ${
                          opt === daily.scenario.correctAnswer ? 'bg-accent-green' : 'bg-felt-600'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div className="text-sm font-bold text-white mt-1">{pct}%</div>
                    <div className={`text-xs ${opt === daily.scenario.correctAnswer ? 'text-accent-gold font-medium' : 'text-gray-500'}`}>
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
