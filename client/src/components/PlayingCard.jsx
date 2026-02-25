const SUIT_SYMBOLS = { h: '♥', d: '♦', c: '♣', s: '♠' };
const SUIT_COLORS = { h: 'text-red-500', d: 'text-red-500', c: 'text-gray-900', s: 'text-gray-900' };

export default function PlayingCard({ card, size = 'md' }) {
  if (!card || card.length < 2) return null;

  const rank = card.slice(0, -1).toUpperCase();
  const suit = card.slice(-1).toLowerCase();
  const symbol = SUIT_SYMBOLS[suit] || suit;
  const colorClass = SUIT_COLORS[suit] || 'text-gray-900';

  const sizes = {
    sm: 'w-10 h-14 text-sm',
    md: 'w-14 h-20 text-lg',
    lg: 'w-20 h-28 text-2xl',
  };

  return (
    <div className={`${sizes[size]} bg-white rounded-lg shadow-lg flex flex-col items-center justify-center relative border border-gray-200 select-none flex-shrink-0`}>
      <div className={`font-bold ${colorClass} leading-none`}>
        {rank}
      </div>
      <div className={`${colorClass} ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'} leading-none mt-0.5`}>
        {symbol}
      </div>
    </div>
  );
}
