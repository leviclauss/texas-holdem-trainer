const BASE = '/api';

async function request(path, options = {}) {
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
