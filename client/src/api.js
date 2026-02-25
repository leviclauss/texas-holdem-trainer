const BASE = '/api';

// Demo mode state: null = unknown, true/false = detected
let _demoMode = null;

// Seed data embedded for demo mode
const DEMO_SCENARIOS = [
  {
    id: 1,
    title: 'UTG Open with AKo',
    category: 'Preflop',
    difficulty: 'Beginner',
    heroPosition: 'UTG',
    villainPosition: null,
    villainStackSize: null,
    heroCards: ['As', 'Kd'],
    boardCards: [],
    potSize: 1.5,
    stackSize: 100,
    actionHistory: 'Folds to Hero in UTG',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Raise',
    raiseSize: 2.5,
    explanation: 'AKo is a premium hand that should always be opened from any position. From UTG, a standard 2.5BB raise is optimal.',
    conceptRef: 'position',
    evDiff: 1.8,
    ratingDelta: { correct: 12, incorrect: -8 },
  },
  {
    id: 2,
    title: 'BTN Open with 76s',
    category: 'Preflop',
    difficulty: 'Beginner',
    heroPosition: 'BTN',
    villainPosition: null,
    villainStackSize: null,
    heroCards: ['7h', '6h'],
    boardCards: [],
    potSize: 1.5,
    stackSize: 100,
    actionHistory: 'Folds to Hero on BTN',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Raise',
    raiseSize: 2.5,
    explanation: '76s is a profitable open from the button. With position and a hand that can make straights, flushes, and two pairs, this is a standard open.',
    conceptRef: 'position',
    evDiff: 0.9,
    ratingDelta: { correct: 10, incorrect: -6 },
  },
  {
    id: 5,
    title: 'C-Bet on Dry Flop',
    category: 'Flop',
    difficulty: 'Beginner',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    villainStackSize: null,
    heroCards: ['Ah', 'Kd'],
    boardCards: ['Ks', '7c', '2d'],
    potSize: 6.0,
    stackSize: 94,
    actionHistory: 'Hero raised BTN, BB called. Flop: K\u2660 7\u2663 2\u2666. BB checks.',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Raise',
    raiseSize: 4.0,
    explanation: 'With top pair top kicker on a dry board, a continuation bet is standard. This board heavily favors the preflop raiser\'s range.',
    conceptRef: 'c-betting',
    evDiff: 1.5,
    ratingDelta: { correct: 10, incorrect: -6 },
  },
  {
    id: 7,
    title: 'Turn Barrel with Nut Flush Draw',
    category: 'Turn',
    difficulty: 'Intermediate',
    heroPosition: 'CO',
    villainPosition: 'BB',
    villainStackSize: null,
    heroCards: ['Ah', '5h'],
    boardCards: ['Kh', '9h', '3c', 'Jd'],
    potSize: 12.0,
    stackSize: 82,
    actionHistory: 'Hero raised CO, BB called. Flop K\u2665 9\u2665 3\u2663: Hero bet 4BB, BB called. Turn J\u2666: BB checks.',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Raise',
    raiseSize: 9.0,
    explanation: 'With the nut flush draw, you have 9 clean outs (~19% equity) plus fold equity. Betting the turn as a semi-bluff is highly profitable.',
    conceptRef: 'equity',
    evDiff: 1.2,
    ratingDelta: { correct: 14, incorrect: -8 },
  },
  {
    id: 6,
    title: 'Bluff Catch on River',
    category: 'Bluff Catch',
    difficulty: 'Advanced',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    villainStackSize: null,
    heroCards: ['Ad', 'Jh'],
    boardCards: ['As', '8c', '3d', '5h', '9c'],
    potSize: 24.0,
    stackSize: 65,
    actionHistory: 'BTN raised, Hero called BB. Flop: A\u2660 8\u2663 3\u2666 check-check. Turn 5\u2665: Hero bet 4BB, BTN called. River 9\u2663: Hero checks, BTN bets 18BB.',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Call',
    raiseSize: null,
    explanation: 'AJ is near the top of your checking range on this river. You\'re getting ~2.3:1 on a call, needing ~30% equity. AJ is a mandatory bluff catch.',
    conceptRef: 'bluff-catching',
    evDiff: 0.6,
    ratingDelta: { correct: 18, incorrect: -10 },
  },
  {
    id: 11,
    title: 'Facing River Overbet',
    category: 'River',
    difficulty: 'Advanced',
    heroPosition: 'CO',
    villainPosition: 'BTN',
    villainStackSize: null,
    heroCards: ['Td', 'Tc'],
    boardCards: ['9d', '6c', '2s', '4h', 'Qs'],
    potSize: 20.0,
    stackSize: 55,
    actionHistory: 'Hero raised CO, BTN called. Flop 9\u2666 6\u2663 2\u2660 check-check. Turn 4\u2665: Hero bet 6BB, BTN called. River Q\u2660: Hero checks, BTN bets 30BB (1.5x pot).',
    options: ['Fold', 'Call', 'Raise'],
    correctAnswer: 'Fold',
    raiseSize: null,
    explanation: 'An overbet on this river polarizes villain\'s range to very strong hands or bluffs. TT doesn\'t meet the equity threshold against a balanced overbet range.',
    conceptRef: 'bluff-catching',
    evDiff: -0.3,
    ratingDelta: { correct: 18, incorrect: -12 },
  },
];

const DEMO_RANGES = [
  {
    id: 1,
    title: 'BTN Open (RFI)',
    description: 'Which hands should you open-raise from the Button when folded to you?',
    position: 'BTN',
    action: 'Open Raise',
    stackDepth: 100,
    scenario: 'Folded to you on the Button. Standard 100BB deep cash game.',
    range: [
      'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
      'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
      'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o',
      'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
      'KQo','KJo','KTo','K9o',
      'QJs','QTs','Q9s','Q8s','Q7s','Q6s',
      'QJo','QTo','Q9o',
      'JTs','J9s','J8s','J7s',
      'JTo','J9o',
      'T9s','T8s','T7s',
      'T9o',
      '98s','97s','96s',
      '98o',
      '87s','86s','85s',
      '87o',
      '76s','75s',
      '76o',
      '65s','64s',
      '54s','53s',
      '43s',
    ],
    explanation: 'The Button is the most profitable position at the table because you always have position postflop. This allows for a very wide opening range of ~45% of hands.',
  },
  {
    id: 2,
    title: 'UTG Open (RFI)',
    description: 'Which hands should you open-raise from Under The Gun?',
    position: 'UTG',
    action: 'Open Raise',
    stackDepth: 100,
    scenario: 'You are Under The Gun at a 6-max table. Standard 100BB deep.',
    range: [
      'AA','KK','QQ','JJ','TT','99','88','77',
      'AKs','AQs','AJs','ATs','A9s','A5s','A4s',
      'AKo','AQo','AJo',
      'KQs','KJs','KTs',
      'KQo',
      'QJs','QTs',
      'JTs','J9s',
      'T9s',
      '98s',
      '87s',
      '76s',
    ],
    explanation: 'UTG is the tightest opening position because you have 5 players left to act who could have strong hands. Your range should be ~18% of hands.',
  },
  {
    id: 3,
    title: 'BB Defend vs BTN Open',
    description: 'Which hands should you defend from the Big Blind against a Button open?',
    position: 'BB',
    action: 'Defend (Call)',
    stackDepth: 100,
    scenario: 'Button raises to 2.5BB, Small Blind folds. You are in the Big Blind.',
    range: [
      'JJ','TT','99','88','77','66','55','44','33','22',
      'AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
      'AQo','AJo','ATo','A9o','A8o',
      'KQs','KJs','KTs','K9s','K8s','K7s','K6s',
      'KQo','KJo','KTo','K9o',
      'QJs','QTs','Q9s','Q8s','Q7s',
      'QJo','QTo','Q9o',
      'JTs','J9s','J8s','J7s',
      'JTo','J9o',
      'T9s','T8s','T7s',
      'T9o','T8o',
      '98s','97s','96s',
      '98o',
      '87s','86s','85s',
      '87o',
      '76s','75s',
      '76o',
      '65s','64s',
      '54s','53s',
      '43s',
    ],
    explanation: 'The BB gets an excellent price to defend (2.67:1 odds), allowing a very wide defending range of ~55%.',
  },
];

const DEMO_CONCEPTS = [
  {
    id: 'pot-odds',
    title: 'Pot Odds',
    shortDescription: 'Calculate whether a call is profitable based on the ratio of the pot to the bet you must call.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    content: 'Pot odds represent the ratio between the current pot size and the cost of a call.\n\n**How to Calculate:**\n1. Add up the current pot + villain\'s bet = total pot\n2. Divide the call amount by the total pot\n3. Convert to a percentage\n\n**Common Pot Odds:**\n- 1/2 pot bet \u2192 need ~25% equity\n- 2/3 pot bet \u2192 need ~29% equity\n- Full pot bet \u2192 need ~33% equity',
    exampleHand: 'You hold 8\u26657\u2665 on a board of K\u26604\u26652\u2665. Pot is 8BB and villain bets 4BB. You need 25% equity. With a flush draw (9 outs), you have ~36% equity \u2014 easy call.',
    keyTakeaways: [
      'Always calculate pot odds before calling a bet',
      'Compare your hand\'s equity to the pot odds requirement',
      'Smaller bets require less equity to call profitably',
      'Pot odds only consider the current street',
    ],
  },
  {
    id: 'equity',
    title: 'Equity',
    shortDescription: 'Your hand\'s share of the pot based on how often it will win at showdown.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    content: 'Equity is the percentage of the pot that belongs to you based on how often your hand will win.\n\n**Key Equity Matchups:**\n- Overpair vs underpair: ~80% vs 20%\n- Two overcards vs pair: ~45% vs 55%\n- Flush draw vs top pair: ~35% vs 65%',
    exampleHand: 'You hold A\u2660K\u2660 and villain has J\u2665J\u2663 preflop. Your equity is ~47% \u2014 nearly a coin flip.',
    keyTakeaways: [
      'Equity is a mathematical concept, not a guarantee',
      'Always think in terms of ranges, not specific hands',
      'Combine equity with pot odds to make optimal decisions',
    ],
  },
  {
    id: 'position',
    title: 'Position',
    shortDescription: 'Why acting last gives you a massive strategic advantage in poker.',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    content: 'Position refers to where you sit relative to the dealer button.\n\n**Why Position Matters:**\n1. Information: You see what opponents do before you act\n2. Pot control: You decide whether to bet or check last\n3. Bluff efficiency: You can bluff when checked to',
    exampleHand: 'You hold T\u26609\u2660 on BTN and raise. BB calls. Flop: Q\u26658\u26663\u2663. BB checks. With position, you can c-bet as a bluff knowing you\'ll see villain\'s response first.',
    keyTakeaways: [
      'The Button is the most profitable position',
      'Being out of position is a major disadvantage',
      'Position allows better decision-making on every street',
    ],
  },
  {
    id: 'c-betting',
    title: 'C-Betting (Continuation Betting)',
    shortDescription: 'Betting the flop as the preflop raiser to maintain initiative and pressure opponents.',
    difficulty: 'Beginner',
    category: 'Strategy',
    content: 'A continuation bet (c-bet) is a bet made by the preflop raiser on the flop.\n\n**When to C-Bet Frequently:**\n- Dry, high-card boards (A-K-x, K-Q-x)\n- Paired boards (K-K-x)\n\n**When to C-Bet Selectively:**\n- Wet, connected boards\n- Multi-way pots',
    exampleHand: 'You raised from CO, BB called. Flop: A\u26667\u26602\u2663. Excellent c-bet board. Bet 1/3 pot with your entire range.',
    keyTakeaways: [
      'C-bet based on range advantage, not just your specific hand',
      'Small c-bets work well on dry, high-card boards',
      'Larger c-bets are better on wet, draw-heavy boards',
    ],
  },
  {
    id: 'bluff-catching',
    title: 'Bluff Catching',
    shortDescription: 'How to decide whether to call with a medium-strength hand facing a bet.',
    difficulty: 'Advanced',
    category: 'Strategy',
    content: 'Bluff catching is calling a bet with a hand that only beats bluffs.\n\n**Framework:**\n1. Calculate pot odds\n2. Count villain\'s value combos\n3. Count villain\'s potential bluffs\n4. If bluffs are frequent enough \u2192 call',
    exampleHand: 'River pot is 20BB. Villain bets 10BB. You hold A\u2665Q\u2663 on A\u26608\u26633\u26665\u26652\u2660. Count value vs bluff combos to decide.',
    keyTakeaways: [
      'Bluff catching requires counting value vs bluff combinations',
      'Use pot odds to determine how often you need to be right',
      'Don\'t bluff-catch against opponents who never bluff',
    ],
  },
];

function makeDemoUser() {
  return {
    id: 'demo-user',
    elo_overall: 1200,
    elo_preflop: 1200,
    elo_flop: 1200,
    elo_turn: 1200,
    elo_river: 1200,
    streak: 0,
    last_activity_date: null,
    created_at: new Date().toISOString(),
  };
}

function getDemoDaily() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const scenarioIndex = dayOfYear % DEMO_SCENARIOS.length;
  const scenario = DEMO_SCENARIOS[scenarioIndex];

  const correctPct = 35 + (dayOfYear % 30);
  const remaining = 100 - correctPct;
  const option2Pct = Math.floor(remaining * 0.4);
  const option3Pct = remaining - option2Pct;

  const communityStats = {};
  const correctIdx = scenario.options.indexOf(scenario.correctAnswer);
  scenario.options.forEach((opt, i) => {
    if (i === correctIdx) communityStats[opt] = correctPct;
    else if (Object.keys(communityStats).length === scenario.options.length - 1) communityStats[opt] = option3Pct;
    else communityStats[opt] = option2Pct;
  });

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const secondsRemaining = Math.floor((tomorrow - today) / 1000);

  return {
    scenario,
    communityStats,
    correctPct,
    secondsRemaining,
    date: today.toISOString().split('T')[0],
  };
}

function getDemoData(path, options = {}) {
  // User routes
  if (path.startsWith('/users')) {
    return makeDemoUser();
  }

  // Scenarios
  if (path === '/scenarios' || path.startsWith('/scenarios?')) {
    return DEMO_SCENARIOS;
  }
  if (path.startsWith('/scenarios/')) {
    const id = parseInt(path.split('/')[2]);
    return DEMO_SCENARIOS.find(s => s.id === id) || DEMO_SCENARIOS[0];
  }

  // Quiz submit
  if (path === '/quiz/submit') {
    const body = options.body ? JSON.parse(options.body) : {};
    const scenario = DEMO_SCENARIOS.find(s => s.id === body.scenarioId) || DEMO_SCENARIOS[0];
    const isCorrect = body.answer === scenario.correctAnswer;
    return {
      isCorrect,
      correctAnswer: scenario.correctAnswer,
      explanation: scenario.explanation,
      conceptRef: scenario.conceptRef,
      ratingChange: isCorrect ? scenario.ratingDelta.correct : scenario.ratingDelta.incorrect,
      raiseSize: scenario.raiseSize,
      user: makeDemoUser(),
    };
  }

  // Ranges
  if (path === '/ranges') {
    return DEMO_RANGES;
  }
  if (path.startsWith('/ranges/')) {
    const id = parseInt(path.split('/')[2]);
    return DEMO_RANGES.find(r => r.id === id) || DEMO_RANGES[0];
  }

  // Range submit
  if (path === '/ranges/submit') {
    const body = options.body ? JSON.parse(options.body) : {};
    const range = DEMO_RANGES.find(r => r.id === body.rangeId) || DEMO_RANGES[0];
    const correctSet = new Set(range.range);
    const selectedSet = new Set(body.selectedHands || []);
    const correctHands = (body.selectedHands || []).filter(h => correctSet.has(h));
    const missedHands = range.range.filter(h => !selectedSet.has(h));
    const extraHands = (body.selectedHands || []).filter(h => !correctSet.has(h));
    const totalRelevant = new Set([...range.range, ...(body.selectedHands || [])]).size;
    const overlapScore = totalRelevant > 0 ? (correctHands.length / totalRelevant) * 100 : 0;
    return {
      overlapScore: Math.round(overlapScore * 10) / 10,
      correctHands,
      missedHands,
      extraHands,
      totalCorrectInRange: range.range.length,
      explanation: range.explanation,
    };
  }

  // Concepts
  if (path === '/concepts') {
    return DEMO_CONCEPTS.map(({ id, title, shortDescription, difficulty, category }) => ({
      id, title, shortDescription, difficulty, category,
    }));
  }
  if (path.startsWith('/concepts/')) {
    const id = path.split('/')[2];
    return DEMO_CONCEPTS.find(c => c.id === id) || DEMO_CONCEPTS[0];
  }

  // Daily
  if (path === '/daily') {
    return getDemoDaily();
  }
  if (path.startsWith('/daily/check/')) {
    return { completed: false, completion: null };
  }

  // Daily submit
  if (path === '/daily/submit') {
    const body = options.body ? JSON.parse(options.body) : {};
    const daily = getDemoDaily();
    const isCorrect = body.answer === daily.scenario.correctAnswer;
    return {
      isCorrect,
      correctAnswer: daily.scenario.correctAnswer,
      explanation: daily.scenario.explanation,
      ratingChange: isCorrect ? daily.scenario.ratingDelta.correct : daily.scenario.ratingDelta.incorrect,
    };
  }

  // Stats
  if (path.startsWith('/stats/')) {
    const user = makeDemoUser();
    return {
      user,
      tier: 'Fish',
      totalAttempts: 0,
      quizAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      categoryStats: [],
      recentActivity: [],
      rangeAttempts: 0,
      dailyChallenges: 0,
      favoriteCategory: 'None yet',
    };
  }

  return {};
}

async function request(path, options = {}) {
  // If we already know we're in demo mode, skip the network request
  if (_demoMode === true) {
    return getDemoData(path, options);
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      // If we get a 404 or other error and haven't confirmed backend exists,
      // check if this is a "no backend" situation
      if (_demoMode === null) {
        _demoMode = true;
        console.warn('Backend not available, switching to demo mode');
        return getDemoData(path, options);
      }
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    // Backend is confirmed working
    _demoMode = false;
    return res.json();
  } catch (err) {
    // Network error (fetch failed entirely) — no backend available
    if (_demoMode === null || _demoMode === true) {
      _demoMode = true;
      console.warn('Backend not available, using demo mode');
      return getDemoData(path, options);
    }
    throw err;
  }
}

export const api = {
  // Users
  createUser: (id) => request('/users', { method: 'POST', body: JSON.stringify({ id }) }),
  getUser: (id) => request(`/users/${id}`),

  // Scenarios
  getScenarios: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/scenarios${qs ? `?${qs}` : ''}`);
  },
  getScenario: (id) => request(`/scenarios/${id}`),

  // Quiz
  submitQuiz: (userId, scenarioId, answer) =>
    request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ userId, scenarioId, answer }),
    }),

  // Ranges
  getRanges: () => request('/ranges'),
  getRange: (id) => request(`/ranges/${id}`),
  submitRange: (userId, rangeId, selectedHands) =>
    request('/ranges/submit', {
      method: 'POST',
      body: JSON.stringify({ userId, rangeId, selectedHands }),
    }),

  // Concepts
  getConcepts: () => request('/concepts'),
  getConcept: (id) => request(`/concepts/${id}`),

  // Daily
  getDaily: () => request('/daily'),
  checkDaily: (userId) => request(`/daily/check/${userId}`),
  submitDaily: (userId, scenarioId, answer, date) =>
    request('/daily/submit', {
      method: 'POST',
      body: JSON.stringify({ userId, scenarioId, answer, date }),
    }),

  // Stats
  getStats: (userId) => request(`/stats/${userId}`),
};
