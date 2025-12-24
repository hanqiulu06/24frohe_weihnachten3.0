
import React from 'react';

interface ParticleTextProps {
  text: string;
}

const VibeText: React.FC<ParticleTextProps> = () => {
  return (
    <div className="relative flex flex-col items-start justify-center select-none py-4 overflow-visible">
      <div className="vibe-container flex flex-col leading-[0.85] tracking-[-0.05em]">
        <div className="vibe-row">
          <VibeLine text="FROHE" />
        </div>
        <div className="vibe-row">
          <VibeLine text="WEIHNACHTEN" />
        </div>
      </div>

      <style>{`
        .vibe-container {
          font-family: 'Syncopate', sans-serif;
          font-weight: 900;
          font-size: clamp(2rem, 6vw, 4rem);
          animation: vibe-breathing 8s ease-in-out infinite;
        }

        .vibe-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .vibe-text-base {
          position: relative;
          color: white;
          z-index: 10;
          filter: blur(1.8px);
        }

        .vibe-text-cyan {
          position: absolute;
          top: 0;
          left: -3px;
          color: #0ff;
          opacity: 0.5;
          mix-blend-mode: screen;
          filter: blur(4px);
          z-index: 5;
        }

        .vibe-text-magenta {
          position: absolute;
          top: 0;
          left: 3px;
          color: #f0f;
          opacity: 0.5;
          mix-blend-mode: screen;
          filter: blur(4px);
          z-index: 5;
        }

        .vibe-grain {
          position: absolute;
          inset: -30px;
          filter: url(#vibe-noise);
          pointer-events: none;
          z-index: 20;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

const VibeLine: React.FC<{ text: string }> = ({ text }) => (
  <div className="relative">
    <span className="vibe-text-base">{text}</span>
    <span className="vibe-text-cyan" aria-hidden="true">{text}</span>
    <span className="vibe-text-magenta" aria-hidden="true">{text}</span>
    <div className="vibe-grain" aria-hidden="true" />
  </div>
);

export default VibeText;
