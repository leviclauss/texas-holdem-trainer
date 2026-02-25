import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useUser } from '../UserContext';
import { api } from '../api';
import Loading from '../components/Loading';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [s, d] = await Promise.all([
          api.getStats(user.id),
          api.getDaily(),
        ]);
        setStats(s);
        setDaily(d);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (userLoading || loading) return <Loading />;
  if (!user) return <div className="text-center py-20 text-gray-400">Failed to load user</div>;

  const radarData = [
    { category: 'Preflop', value: user.elo_preflop },
    { category: 'Flop', value: user.elo_flop },
    { category: 'Turn', value: user.elo_turn },
    { category: 'River', value: user.elo_river },
  ];

  const getTierLabel = (elo) => {
    if (elo >= 1500) return { label: 'GTO Wizard', color: 'text-purple-400' };
    if (elo >= 1300) return { label: 'Shark', color: 'text-blue-400' };
    if (elo >= 1150) return { label: 'Grinder', color: 'text-green-400' };
    if (elo >= 1050) return { label: 'Regular', color: 'text-yellow-400' };
    return { label: 'Fish', color: 'text-gray-400' };
  };

  const tier = getTierLabel(user.elo_overall);

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="card-surface p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome to <span className="text-accent-gold">RangeIQ</span>
            </h1>
            <p className="text-gray-400 mt-1">Master your poker decisions, one hand at a time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-gold">{user.elo_overall}</div>
              <div className={`text-sm font-medium ${tier.color}`}>{tier.label}</div>
            </div>
            {stats && stats.user.streak > 0 && (
              <div className="text-center border-l border-felt-600 pl-4">
                <div className="text-2xl font-bold text-orange-400">{stats.user.streak}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Skill Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#2e4459" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 13 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[800, 1400]}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
              />
              <Radar
                name="ELO"
                dataKey="value"
                stroke="#f0c040"
                fill="#f0c040"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Challenge Banner */}
        <div className="space-y-6">
          {daily && (
            <div className="card-surface p-6 border-l-4 border-accent-gold">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-accent-gold uppercase tracking-wider">Daily Challenge</div>
                  <h3 className="text-lg font-semibold text-white mt-1">{daily.scenario.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {daily.correctPct}% of players got it right
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Resets in</div>
                  <div className="text-accent-gold font-mono font-semibold">
                    {formatCountdown(daily.secondsRemaining)}
                  </div>
                </div>
              </div>
              <Link to="/daily" className="btn-gold inline-block mt-4 text-sm">
                Play Now
              </Link>
            </div>
          )}

          {/* Quick Start */}
          <div className="card-surface p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/quiz" className="btn-primary text-center text-sm">
                Spot Quiz
              </Link>
              <Link to="/range-trainer" className="btn-outline text-center text-sm">
                Range Trainer
              </Link>
              <Link to="/daily" className="btn-gold text-center text-sm">
                Daily Challenge
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats && stats.recentActivity.length > 0 && (
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-felt-600/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${a.is_correct ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <div className="text-sm text-white">{a.scenarioTitle}</div>
                    <div className="text-xs text-gray-500">{a.category}</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${a.rating_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {a.rating_change >= 0 ? '+' : ''}{a.rating_change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
