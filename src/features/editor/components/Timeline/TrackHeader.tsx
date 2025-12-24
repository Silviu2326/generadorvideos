import React, { useState } from 'react';
import { Track } from '../../../../types/editor';
import { VolumeX, Headphones, Lock, Unlock, Volume2 } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSoloed, setIsSoloed] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 text-white w-64">
      <div className="font-medium truncate mr-2" title={track.name}>
        {track.name}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1 rounded hover:bg-gray-700 ${isMuted ? 'text-red-400' : 'text-gray-400'}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button
          onClick={() => setIsSoloed(!isSoloed)}
          className={`p-1 rounded hover:bg-gray-700 ${isSoloed ? 'text-yellow-400' : 'text-gray-400'}`}
          title="Solo"
        >
          <Headphones size={16} />
        </button>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-1 rounded hover:bg-gray-700 ${isLocked ? 'text-blue-400' : 'text-gray-400'}`}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>
    </div>
  );
};
