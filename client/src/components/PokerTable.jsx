import { useState } from 'react';

const POSITIONS_6MAX = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// Seat placements around an oval table (counter-clockwise: BTN → SB → BB → UTG → HJ → CO)
const SEAT_LAYOUT = {
  BTN: { top: '88%', left: '15%',  labelSide: 'below' },
  SB:  { top: '50%', left: '0%',   labelSide: 'left' },
  BB:  { top: '12%', left: '15%',  labelSide: 'above' },
  UTG: { top: '12%', left: '85%',  labelSide: 'above' },
  HJ:  { top: '50%', left: '100%', labelSide: 'right' },
  CO:  { top: '88%', left: '85%',  labelSide: 'below' },
};

const POSITION_INFO = {
  BTN: { name: 'Button', desc: 'The dealer. Best position — acts last postflop.' },
  SB:  { name: 'Small Blind', desc: 'Posts the small blind. First to act postflop.' },
  BB:  { name: 'Big Blind', desc: 'Posts the big blind. Defends the widest range.' },
  UTG: { name: 'Under the Gun', desc: 'First to act preflop. Tightest opening range.' },
  HJ:  { name: 'Hijack', desc: 'Middle position. Range opens up slightly.' },
  CO:  { name: 'Cutoff', desc: 'One seat before the button. Strong late position.' },
};

export default function PokerTable({ heroPosition, villainPosition }) {
  const [tooltip, setTooltip] = useState({ pos: null, clientX: 0, clientY: 0 });

  function handleMouseMove(e, pos) {
    setTooltip({ pos, clientX: e.clientX, clientY: e.clientY });
  }

  function handleMouseLeave() {
    setTooltip({ pos: null, clientX: 0, clientY: 0 });
  }

  return (
    <div className="card-surface p-4 sm:p-6">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Table Position</div>
      <div className="relative mx-auto poker-table-container" style={{ maxWidth: '320px', aspectRatio: '16 / 10' }}>
        {/* Felt table oval */}
        <div
          className="absolute inset-2 sm:inset-3 rounded-[50%] border-2 border-accent-gold/30"
          style={{
            background: 'radial-gradient(ellipse at center, #1a3a2a 0%, #0f2a1a 60%, #0a1f14 100%)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 0 15px rgba(0,0,0,0.3)',
          }}
        >
          {/* Dealer chip in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] sm:text-xs text-accent-gold/50 font-semibold tracking-widest uppercase">
              6-Max
            </div>
          </div>
        </div>

        {/* Seats */}
        {POSITIONS_6MAX.map((pos) => {
          const layout = SEAT_LAYOUT[pos];
          const isHero = pos === heroPosition;
          const isVillain = pos === villainPosition;
          const isActive = isHero || isVillain;

          return (
            <div
              key={pos}
              className="absolute"
              style={{
                top: layout.top,
                left: layout.left,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Seat circle */}
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-default
                  ${isHero
                    ? 'bg-accent-green text-white ring-2 ring-accent-green-light ring-offset-2 ring-offset-felt-900 shadow-lg shadow-accent-green/30'
                    : isVillain
                    ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-2 ring-offset-felt-900 shadow-lg shadow-red-600/30'
                    : 'bg-felt-700 text-gray-500 border border-felt-600/50'
                  }
                `}
                onMouseMove={(e) => handleMouseMove(e, pos)}
                onMouseLeave={handleMouseLeave}
              >
                {pos}
              </div>

              {/* Role label */}
              {isActive && (
                <div
                  className={`
                    absolute whitespace-nowrap text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider pointer-events-none
                    ${isHero ? 'text-accent-green-light' : 'text-red-400'}
                    ${layout.labelSide === 'above' ? 'bottom-full left-1/2 -translate-x-1/2 mb-1' : ''}
                    ${layout.labelSide === 'below' ? 'top-full left-1/2 -translate-x-1/2 mt-1' : ''}
                    ${layout.labelSide === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-1.5' : ''}
                    ${layout.labelSide === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-1.5' : ''}
                  `}
                >
                  {isHero ? 'Hero' : 'Villain'}
                </div>
              )}
            </div>
          );
        })}

        {/* Cursor-following tooltip */}
        {tooltip.pos && (
          <div
            className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-md bg-gray-900 border border-gray-700 shadow-lg w-[180px]"
            style={{ left: tooltip.clientX + 12, top: tooltip.clientY - 8, transform: 'translateY(-100%)' }}
          >
            <div className="text-[10px] font-bold text-white">{POSITION_INFO[tooltip.pos].name}</div>
            <div className="text-[9px] text-gray-400">{POSITION_INFO[tooltip.pos].desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}
