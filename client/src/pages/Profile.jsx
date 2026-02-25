import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useUser } from '../UserContext';
import { api } from '../api';
import Loading from '../components/Loading';

const TIER_CONFIG = {
  'Fish': { color: 'text-gray-400', bg: 'bg-gray-800', icon: '🐟' },
  'Regular': { color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: '♠' },
  'Grinder': { color: 'text-green-400', bg: 'bg-green-900/30', icon: '♦' },
  'Shark': { color: 'text-blue-400', bg: 'bg-blue-900/30', icon: '♣' },
  'GTO Wizard': { color: 'text-purple-400', bg: 'bg-purple-900/30', icon: '♥' },
};

export default function Profile() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const data = await api.getStats(user.id);
        setStats(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <Loading />;
  if (!stats) return <div className="text-center py-20 text-gray-400">Failed to load profile</div>;

  const tierConf = TIER_CONFIG[stats.tier] || TIER_CONFIG['Fish'];

  const radarData = [
    { category: 'Preflop', value: stats.user.elo_preflop },
    { category: 'Flop', value: stats.user.elo_flop },
    { category: 'Turn', value: stats.user.elo_turn },
    { category: 'River', value: stats.user.elo_river },
  ];

  const eloTiers = [
    { name: 'Fish', min: 0, max: 1049 },
    { name: 'Regular', min: 1050, max: 1149 },
    { name: 'Grinder', min: 1150, max: 1299 },
    { name: 'Shark', min: 1300, max: 1499 },
    { name: 'GTO Wizard', min: 1500, max: 2000 },
  ];

  const currentTierObj = eloTiers.find(t => stats.user.elo_overall >= t.min && stats.user.elo_overall <= t.max);
  const progressInTier = currentTierObj
    ? ((stats.user.elo_overall - currentTierObj.min) / (currentTierObj.max - currentTierObj.min)) * 100
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Skill Profile</h1>

      {/* Main Stats Card */}
      <div className="card-surface p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`w-20 h-20 rounded-full ${tierConf.bg} flex items-center justify-center text-3xl border-2 border-felt-600`}>
            {tierConf.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-bold text-accent-gold">{stats.user.elo_overall}</span>
              <span className={`text-lg font-semibold ${tierConf.color}`}>{stats.tier}</span>
            </div>
            {/* Tier progress bar */}
            <div className="mt-2 max-w-md">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{currentTierObj?.name} ({currentTierObj?.min})</span>
                <span>{currentTierObj?.max}</span>
              </div>
              <div className="h-2 bg-felt-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-gold rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressInTier)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <StatBlock label="Streak" value={`${stats.user.streak} days`} color="text-orange-400" />
            <StatBlock label="Accuracy" value={`${stats.accuracy}%`} color="text-green-400" />
            <StatBlock label="Reviewed" value={stats.totalAttempts} color="text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Skill Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#2e4459" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 13 }} />
              <PolarRadiusAxis angle={90} domain={[800, 1400]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
              <Radar name="ELO" dataKey="value" stroke="#f0c040" fill="#f0c040" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Stats */}
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Category Accuracy</h2>
          {stats.categoryStats.length > 0 ? (
            <div className="space-y-4">
              {stats.categoryStats.map(cat => {
                const pct = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{cat.category}</span>
                      <span className="text-gray-400">{cat.correct}/{cat.total} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-felt-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 70 ? '#2d6a4f' : pct >= 40 ? '#f0c040' : '#e53e3e'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Complete some quizzes to see category stats.</p>
          )}

          <div className="mt-6 pt-4 border-t border-felt-600/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Quiz Attempts</span>
                <div className="text-white font-semibold">{stats.quizAttempts}</div>
              </div>
              <div>
                <span className="text-gray-500">Range Attempts</span>
                <div className="text-white font-semibold">{stats.rangeAttempts}</div>
              </div>
              <div>
                <span className="text-gray-500">Daily Challenges</span>
                <div className="text-white font-semibold">{stats.dailyChallenges}</div>
              </div>
              <div>
                <span className="text-gray-500">Favorite Category</span>
                <div className="text-white font-semibold">{stats.favoriteCategory}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Answer</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium text-right">ELO Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-felt-600/30">
                {stats.recentActivity.map((a, i) => (
                  <tr key={i}>
                    <td className="py-2 text-gray-200">{a.scenarioTitle}</td>
                    <td className="py-2 text-gray-400">{a.category}</td>
                    <td className="py-2 text-gray-300">{a.user_answer}</td>
                    <td className="py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${a.is_correct ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                        {a.is_correct ? 'Correct' : 'Wrong'}
                      </span>
                    </td>
                    <td className={`py-2 text-right font-medium ${a.rating_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {a.rating_change >= 0 ? '+' : ''}{a.rating_change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Ladder */}
      <div className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tier Ladder</h2>
        <div className="space-y-2">
          {eloTiers.map(t => {
            const conf = TIER_CONFIG[t.name];
            const isCurrent = t.name === stats.tier;
            return (
              <div
                key={t.name}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-felt-700/60 border border-accent-gold/40' : 'bg-felt-700/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{conf.icon}</span>
                  <span className={`font-medium ${isCurrent ? conf.color : 'text-gray-500'}`}>
                    {t.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{t.min} - {t.max} ELO</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
