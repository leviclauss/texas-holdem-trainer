import PlayingCard from './PlayingCard';
import DifficultyTag from './DifficultyTag';

export default function ScenarioDisplay({ scenario, onAnswer, result, showResult }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
        <DifficultyTag difficulty={scenario.difficulty} />
        <span className="tag bg-felt-700 text-gray-300">{scenario.category}</span>
      </div>

      {/* Scenario info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoBox label="Hero" value={scenario.heroPosition} />
        {scenario.villainPosition && <InfoBox label="Villain" value={scenario.villainPosition} />}
        <InfoBox label="Stack" value={`${scenario.stackSize} BB`} />
        <InfoBox label="Pot" value={`${scenario.potSize} BB`} />
      </div>

      {/* Action History */}
      <div className="card-surface p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Action</div>
        <div className="text-sm text-gray-200">{scenario.actionHistory}</div>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-6">
        {/* Hole cards */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Hand</div>
          <div className="flex gap-2">
            {scenario.heroCards.map((c, i) => (
              <PlayingCard key={i} card={c} size="lg" />
            ))}
          </div>
        </div>

        {/* Board */}
        {scenario.boardCards && scenario.boardCards.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Board</div>
            <div className="flex gap-2">
              {scenario.boardCards.map((c, i) => (
                <PlayingCard key={i} card={c} size="lg" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer buttons */}
      {!showResult && (
        <div className="flex flex-wrap gap-3">
          {scenario.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                opt === 'Fold'
                  ? 'bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-800/50'
                  : opt === 'Call'
                  ? 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/50'
                  : 'bg-green-900/40 hover:bg-green-800/60 text-green-300 border border-green-800/50'
              }`}
            >
              {opt}
              {opt === 'Raise' && scenario.raiseSize ? ` (${scenario.raiseSize}BB)` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Result */}
      {showResult && result && (
        <div className={`card-surface p-6 border-l-4 ${result.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-lg font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            <div className={`text-sm font-medium ${result.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({result.ratingChange >= 0 ? '+' : ''}{result.ratingChange} ELO)
            </div>
          </div>
          {!result.isCorrect && (
            <div className="text-sm text-gray-400 mb-2">
              Correct answer: <span className="text-white font-medium">{result.correctAnswer}</span>
              {result.raiseSize ? ` (${result.raiseSize}BB)` : ''}
            </div>
          )}
          <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
          {result.conceptRef && (
            <a
              href={`/concepts/${result.conceptRef}`}
              className="inline-block mt-3 text-accent-gold hover:text-accent-gold-dark text-sm font-medium transition-colors"
            >
              Learn more about this concept →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-felt-700/50 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-white font-semibold mt-0.5">{value}</div>
    </div>
  );
}
