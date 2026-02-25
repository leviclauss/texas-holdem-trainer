import express from 'express';
import cors from 'cors';
import { getDb, loadSeedData } from './db.js';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load seed data
const { scenarios, ranges, concepts } = loadSeedData();

// Initialize DB
const db = getDb();

// ──────────── USER ROUTES ────────────

app.post('/api/users', (req, res) => {
  const id = req.body.id || randomUUID();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (existing) return res.json(existing);

  db.prepare(
    'INSERT INTO users (id) VALUES (?)'
  ).run(id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ──────────── SCENARIO ROUTES ────────────

app.get('/api/scenarios', (req, res) => {
  let filtered = [...scenarios];
  if (req.query.difficulty) {
    filtered = filtered.filter(s => s.difficulty === req.query.difficulty);
  }
  if (req.query.category) {
    filtered = filtered.filter(s => s.category === req.query.category);
  }
  res.json(filtered);
});

app.get('/api/scenarios/:id', (req, res) => {
  const scenario = scenarios.find(s => s.id === parseInt(req.params.id));
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
  res.json(scenario);
});

// ──────────── QUIZ ROUTES ────────────

app.post('/api/quiz/submit', (req, res) => {
  const { userId, scenarioId, answer } = req.body;
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

  const isCorrect = answer === scenario.correctAnswer;
  const ratingChange = isCorrect
    ? scenario.ratingDelta.correct
    : scenario.ratingDelta.incorrect;

  // Determine which category ELO to update
  const categoryMap = {
    'Preflop': 'elo_preflop',
    'Flop': 'elo_flop',
    'Turn': 'elo_turn',
    'River': 'elo_river',
    '3-Bet Pots': 'elo_preflop',
    'Bluff Catch': 'elo_river'
  };
  const eloColumn = categoryMap[scenario.category] || 'elo_preflop';

  // Update user rating
  const today = new Date().toISOString().split('T')[0];
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const lastDate = user.last_activity_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = user.streak;
  if (lastDate === yesterday) {
    newStreak = user.streak + 1;
  } else if (lastDate !== today) {
    newStreak = 1;
  }

  db.prepare(`
    UPDATE users SET
      elo_overall = MAX(0, elo_overall + ?),
      ${eloColumn} = MAX(0, ${eloColumn} + ?),
      streak = ?,
      last_activity_date = ?
    WHERE id = ?
  `).run(ratingChange, ratingChange, newStreak, today, userId);

  // Record attempt
  db.prepare(`
    INSERT INTO quiz_attempts (user_id, scenario_id, user_answer, correct_answer, is_correct, rating_change, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, scenarioId, answer, scenario.correctAnswer, isCorrect ? 1 : 0, ratingChange, scenario.category);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  res.json({
    isCorrect,
    correctAnswer: scenario.correctAnswer,
    explanation: scenario.explanation,
    conceptRef: scenario.conceptRef,
    ratingChange,
    raiseSize: scenario.raiseSize,
    user: updatedUser
  });
});

// ──────────── RANGE ROUTES ────────────

app.get('/api/ranges', (req, res) => {
  res.json(ranges);
});

app.get('/api/ranges/:id', (req, res) => {
  const range = ranges.find(r => r.id === parseInt(req.params.id));
  if (!range) return res.status(404).json({ error: 'Range not found' });
  res.json(range);
});

app.post('/api/ranges/submit', (req, res) => {
  const { userId, rangeId, selectedHands } = req.body;
  const range = ranges.find(r => r.id === rangeId);
  if (!range) return res.status(404).json({ error: 'Range not found' });

  const correctSet = new Set(range.range);
  const selectedSet = new Set(selectedHands);

  const correctHands = selectedHands.filter(h => correctSet.has(h));
  const missedHands = range.range.filter(h => !selectedSet.has(h));
  const extraHands = selectedHands.filter(h => !correctSet.has(h));

  const totalRelevant = new Set([...range.range, ...selectedHands]).size;
  const overlapScore = totalRelevant > 0
    ? (correctHands.length / totalRelevant) * 100
    : 0;

  // Record attempt
  db.prepare(
    'INSERT INTO range_attempts (user_id, range_id, overlap_score) VALUES (?, ?, ?)'
  ).run(userId, rangeId, overlapScore);

  res.json({
    overlapScore: Math.round(overlapScore * 10) / 10,
    correctHands,
    missedHands,
    extraHands,
    totalCorrectInRange: range.range.length,
    explanation: range.explanation
  });
});

// ──────────── CONCEPT ROUTES ────────────

app.get('/api/concepts', (req, res) => {
  // Return summary list (without full content)
  const summaries = concepts.map(({ id, title, shortDescription, difficulty, category }) => ({
    id, title, shortDescription, difficulty, category
  }));
  res.json(summaries);
});

app.get('/api/concepts/:id', (req, res) => {
  const concept = concepts.find(c => c.id === req.params.id);
  if (!concept) return res.status(404).json({ error: 'Concept not found' });
  res.json(concept);
});

// ──────────── DAILY CHALLENGE ROUTES ────────────

app.get('/api/daily', (req, res) => {
  // Cycle through scenarios based on date
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const scenarioIndex = dayOfYear % scenarios.length;
  const scenario = scenarios[scenarioIndex];

  // Calculate simulated community stats
  const seed = dayOfYear * 7 + scenario.id;
  const correctPct = 35 + (seed % 30); // 35-65% correct
  const remaining = 100 - correctPct;
  const option2Pct = Math.floor(remaining * (0.3 + (seed % 20) / 100));
  const option3Pct = remaining - option2Pct;

  // Map community stats to options
  const communityStats = {};
  const options = scenario.options;
  const correctIdx = options.indexOf(scenario.correctAnswer);
  options.forEach((opt, i) => {
    if (i === correctIdx) communityStats[opt] = correctPct;
    else if (Object.keys(communityStats).length === options.length - 1) communityStats[opt] = option3Pct;
    else communityStats[opt] = option2Pct;
  });

  // Calculate time until midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const secondsRemaining = Math.floor((tomorrow - today) / 1000);

  res.json({
    scenario,
    communityStats,
    correctPct,
    secondsRemaining,
    date: today.toISOString().split('T')[0]
  });
});

app.get('/api/daily/check/:userId', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const completion = db.prepare(
    'SELECT * FROM daily_challenge_completions WHERE user_id = ? AND challenge_date = ?'
  ).get(req.params.userId, today);
  res.json({ completed: !!completion, completion: completion || null });
});

app.post('/api/daily/submit', (req, res) => {
  const { userId, scenarioId, answer, date } = req.body;

  // Check if already completed
  const existing = db.prepare(
    'SELECT * FROM daily_challenge_completions WHERE user_id = ? AND challenge_date = ?'
  ).get(userId, date);
  if (existing) {
    return res.status(400).json({ error: 'Already completed today\'s challenge' });
  }

  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

  const isCorrect = answer === scenario.correctAnswer;

  // Also update ELO
  const ratingChange = isCorrect
    ? scenario.ratingDelta.correct
    : scenario.ratingDelta.incorrect;

  const categoryMap = {
    'Preflop': 'elo_preflop',
    'Flop': 'elo_flop',
    'Turn': 'elo_turn',
    'River': 'elo_river',
    '3-Bet Pots': 'elo_preflop',
    'Bluff Catch': 'elo_river'
  };
  const eloColumn = categoryMap[scenario.category] || 'elo_preflop';
  const today = new Date().toISOString().split('T')[0];
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (user) {
    const lastDate = user.last_activity_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = user.streak;
    if (lastDate === yesterday) {
      newStreak = user.streak + 1;
    } else if (lastDate !== today) {
      newStreak = 1;
    }

    db.prepare(`
      UPDATE users SET
        elo_overall = MAX(0, elo_overall + ?),
        ${eloColumn} = MAX(0, ${eloColumn} + ?),
        streak = ?,
        last_activity_date = ?
      WHERE id = ?
    `).run(ratingChange, ratingChange, newStreak, today, userId);
  }

  db.prepare(`
    INSERT INTO daily_challenge_completions (user_id, challenge_date, scenario_id, user_answer, correct_answer, is_correct)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, date, scenarioId, answer, scenario.correctAnswer, isCorrect ? 1 : 0);

  res.json({
    isCorrect,
    correctAnswer: scenario.correctAnswer,
    explanation: scenario.explanation,
    ratingChange
  });
});

// ──────────── STATS / PROFILE ROUTES ────────────

app.get('/api/stats/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const totalAttempts = db.prepare(
    'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?'
  ).get(userId).count;

  const correctAttempts = db.prepare(
    'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND is_correct = 1'
  ).get(userId).count;

  const categoryStats = db.prepare(`
    SELECT category,
      COUNT(*) as total,
      SUM(is_correct) as correct
    FROM quiz_attempts WHERE user_id = ?
    GROUP BY category
  `).all(userId);

  const recentActivity = db.prepare(`
    SELECT qa.*, datetime(qa.created_at) as created_at
    FROM quiz_attempts qa
    WHERE qa.user_id = ?
    ORDER BY qa.created_at DESC
    LIMIT 5
  `).all(userId);

  // Add scenario titles to recent activity
  const recentWithTitles = recentActivity.map(a => {
    const scenario = scenarios.find(s => s.id === a.scenario_id);
    return { ...a, scenarioTitle: scenario ? scenario.title : 'Unknown' };
  });

  const rangeAttempts = db.prepare(
    'SELECT COUNT(*) as count FROM range_attempts WHERE user_id = ?'
  ).get(userId).count;

  const dailyChallenges = db.prepare(
    'SELECT COUNT(*) as count FROM daily_challenge_completions WHERE user_id = ?'
  ).get(userId).count;

  // Determine tier
  let tier = 'Fish';
  if (user.elo_overall >= 1500) tier = 'GTO Wizard';
  else if (user.elo_overall >= 1300) tier = 'Shark';
  else if (user.elo_overall >= 1150) tier = 'Grinder';
  else if (user.elo_overall >= 1050) tier = 'Regular';

  // Find favorite category
  let favoriteCategory = 'None yet';
  if (categoryStats.length > 0) {
    favoriteCategory = categoryStats.reduce((a, b) => a.total > b.total ? a : b).category;
  }

  res.json({
    user,
    tier,
    totalAttempts: totalAttempts + rangeAttempts + dailyChallenges,
    quizAttempts: totalAttempts,
    correctAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    categoryStats,
    recentActivity: recentWithTitles,
    rangeAttempts,
    dailyChallenges,
    favoriteCategory
  });
});

// Only listen when running directly (not as a Vercel serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`RangeIQ server running on port ${PORT}`);
  });
}

export default app;
