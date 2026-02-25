import { useEffect, useState, useCallback } from 'react';
import { useUser } from '../UserContext';
import { api } from '../api';
import Loading from '../components/Loading';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getHandLabel(row, col) {
  if (row === col) return RANKS[row] + RANKS[col]; // pair
  if (row < col) return RANKS[row] + RANKS[col] + 's'; // suited (top-right)
  return RANKS[col] + RANKS[row] + 'o'; // offsuit (bottom-left)
}

function getHandType(row, col) {
  if (row === col) return 'pair';
  if (row < col) return 'suited';
  return 'offsuit';
}

export default function RangeTrainer() {
  const { user } = useUser();
  const [ranges, setRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedHands, setSelectedHands] = useState(new Set());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'add' or 'remove'

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getRanges();
        setRanges(data);
        if (data.length > 0) setSelectedRange(data[0]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleHand(hand) {
    setSelectedHands(prev => {
      const next = new Set(prev);
      if (next.has(hand)) next.delete(hand);
      else next.add(hand);
      return next;
    });
  }

  const handleMouseDown = useCallback((hand) => {
    setIsDragging(true);
    const adding = !selectedHands.has(hand);
    setDragMode(adding ? 'add' : 'remove');
    setSelectedHands(prev => {
      const next = new Set(prev);
      if (adding) next.add(hand);
      else next.delete(hand);
      return next;
    });
  }, [selectedHands]);

  const handleMouseEnter = useCallback((hand) => {
    if (!isDragging) return;
    setSelectedHands(prev => {
      const next = new Set(prev);
      if (dragMode === 'add') next.add(hand);
      else next.delete(hand);
      return next;
    });
  }, [isDragging, dragMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  async function handleSubmit() {
    if (!user || !selectedRange) return;
    try {
      const res = await api.submitRange(user.id, selectedRange.id, Array.from(selectedHands));
      setResult(res);
    } catch (err) {
      console.error(err);
    }
  }

  function handleReset() {
    setSelectedHands(new Set());
    setResult(null);
  }

  function handleNewScenario() {
    const currentIdx = ranges.findIndex(r => r.id === selectedRange.id);
    const nextIdx = (currentIdx + 1) % ranges.length;
    setSelectedRange(ranges[nextIdx]);
    setSelectedHands(new Set());
    setResult(null);
  }

  if (loading) return <Loading />;

  const correctSet = result ? new Set(result.correctHands) : null;
  const missedSet = result ? new Set(result.missedHands) : null;
  const extraSet = result ? new Set(result.extraHands) : null;

  function getCellColor(hand) {
    if (result) {
      if (correctSet.has(hand)) return 'bg-green-700/60 border-green-500';
      if (missedSet.has(hand)) return 'bg-red-700/40 border-red-500';
      if (extraSet.has(hand)) return 'bg-yellow-700/40 border-yellow-500';
      return 'bg-felt-700/30 border-felt-600/30';
    }
    if (selectedHands.has(hand)) return 'bg-accent-green/50 border-accent-green';
    return 'bg-felt-700/30 border-felt-600/30 hover:bg-felt-600/50';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Range Trainer</h1>
        <select
          value={selectedRange?.id || ''}
          onChange={e => {
            const r = ranges.find(r => r.id === parseInt(e.target.value));
            setSelectedRange(r);
            handleReset();
          }}
          className="bg-felt-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-felt-600 focus:outline-none focus:border-accent-green"
        >
          {ranges.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </div>

      {selectedRange && (
        <div className="card-surface p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">{selectedRange.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{selectedRange.description}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>Position: <span className="text-white">{selectedRange.position}</span></span>
              <span>Action: <span className="text-white">{selectedRange.action}</span></span>
              <span>Depth: <span className="text-white">{selectedRange.stackDepth}BB</span></span>
            </div>
          </div>

          {/* 13x13 Grid */}
          <div className="overflow-x-auto">
            <div
              className="inline-grid gap-[2px] select-none"
              style={{ gridTemplateColumns: `repeat(13, minmax(0, 1fr))` }}
            >
              {RANKS.map((_, row) =>
                RANKS.map((_, col) => {
                  const hand = getHandLabel(row, col);
                  const type = getHandType(row, col);
                  return (
                    <div
                      key={hand}
                      className={`w-[42px] h-[36px] sm:w-[50px] sm:h-[40px] flex items-center justify-center text-[10px] sm:text-xs font-medium rounded cursor-pointer border transition-colors duration-100 ${getCellColor(hand)} ${
                        type === 'pair' ? 'font-bold' : ''
                      }`}
                      onMouseDown={() => !result && handleMouseDown(hand)}
                      onMouseEnter={() => !result && handleMouseEnter(hand)}
                    >
                      {hand}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-felt-700/50 border border-felt-600" /> Pairs (diagonal)
            </span>
            <span>Top-right = Suited</span>
            <span>Bottom-left = Offsuit</span>
            {result && (
              <>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-700/60 border border-green-500" /> Correct
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-700/40 border border-red-500" /> Missed
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-yellow-700/40 border border-yellow-500" /> Extra
                </span>
              </>
            )}
          </div>

          <div className="text-sm text-gray-400 mt-2">
            Selected: <span className="text-white font-medium">{selectedHands.size}</span> hands
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            {!result ? (
              <>
                <button onClick={handleSubmit} className="btn-primary" disabled={selectedHands.size === 0}>
                  Submit Range
                </button>
                <button onClick={handleReset} className="btn-outline">
                  Clear
                </button>
              </>
            ) : (
              <button onClick={handleNewScenario} className="btn-primary">
                Next Scenario →
              </button>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6 card-surface p-6 border-l-4 border-accent-gold bg-felt-700/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-2xl font-bold text-accent-gold">{result.overlapScore}%</div>
                <div className="text-sm text-gray-400">Match Score</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-green-400 font-medium">{result.correctHands.length}</div>
                  <div className="text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-red-400 font-medium">{result.missedHands.length}</div>
                  <div className="text-gray-500">Missed</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-medium">{result.extraHands.length}</div>
                  <div className="text-gray-500">Extra</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
