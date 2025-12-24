import React, { useEffect, useRef } from 'react';

interface TimeRulerProps {
  zoomLevel: number;
}

export const TimeRuler: React.FC<TimeRulerProps> = ({ zoomLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas dimensions to match display size for crisp rendering
    // Assuming the parent container allows scrolling, we set a large width based on zoom
    // For now, let's just make it wide enough to demonstrate. 
    // In a real app, this might be calculated from total duration.
    const durationSeconds = 600; // 10 minutes default
    const pixelsPerSecond = 100 * zoomLevel;
    const width = durationSeconds * pixelsPerSecond;
    const height = 30; // Fixed height

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Style
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#999';
    ctx.font = '10px sans-serif';
    ctx.lineWidth = 1;

    ctx.beginPath();
    
    // Draw lines
    for (let i = 0; i <= durationSeconds; i++) {
      const x = i * pixelsPerSecond;
      
      // Draw vertical line for the second
      ctx.moveTo(x + 0.5, 0); // +0.5 for crisp lines
      ctx.lineTo(x + 0.5, height);

      // Draw label
      ctx.fillText(`${i}s`, x + 5, height - 5);
      
      // Optional: Draw smaller ticks between seconds if zoomed in enough
      if (pixelsPerSecond > 50) {
        const subTicks = 10;
        const subGap = pixelsPerSecond / subTicks;
        for(let j = 1; j < subTicks; j++) {
            const subX = x + j * subGap;
            ctx.moveTo(subX + 0.5, height - 5);
            ctx.lineTo(subX + 0.5, height);
        }
      }
    }
    
    ctx.stroke();

  }, [zoomLevel]);

  return (
    <div className="w-full overflow-hidden bg-gray-900 border-b border-gray-700">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block' }}
      />
    </div>
  );
};
