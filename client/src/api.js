const BASE = '/api';

function isDemoMode() {
  return typeof window !== 'undefined' && 
         import.meta.env.PROD && 
         window.location.hostname.includes('vercel.app');
}

async function request(path, options = {}) {
  // Demo mode fallback for Vercel deployment
  if (isDemoMode()) {
    console.warn('Demo mode: API calls disabled on Vercel deployment');
    return getDemoData(path);
  }
  
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

function getDemoData(path) {
  // Demo data for when backend isn't available  
  const data = (() => {
    if (path.startsWith('/users')) {
      return { id: 'demo-user', eloQuiz: 1200, eloRange: 1200, created_at: new Date().toISOString() };
    }
    if (path.startsWith('/scenarios')) {
      return [
        {
          id: 'demo-scenario-1',
          title: 'Demo Hand',
          description: 'Practice hand for demo mode',
          street: 'preflop',
          position: 'BB',
          action: 'Demo action',
          difficulty: 1
        }
      ];
    }
    if (path.startsWith('/concepts')) {
      return [
        {
          id: 'demo-concept-1',
          title: 'Demo Concept',
          description: 'Practice concept for demo mode',
          category: 'fundamentals'
        }
      ];
    }
    if (path.startsWith('/daily')) {
      return { scenario: null, completed: false };
    }
    if (path.startsWith('/stats')) {
      return { eloQuiz: 1200, eloRange: 1200, attempts: 0, correct: 0 };
    }
    if (path.startsWith('/ranges')) {
      return [
        {
          id: 'demo-range-1',
          title: 'Demo Range',
          description: 'Practice range for demo mode',
          position: 'BTN',
          action: 'open'
        }
      ];
    }
    return {};
  })();
  
  // Return a resolved promise to match async behavior
  return Promise.resolve(data);
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
