export const formatTimecode = (seconds: number): string => {
  const fps = 30;
  const totalFrames = Math.round(seconds * fps);

  const minutes = Math.floor(totalFrames / (fps * 60));
  const remainingFramesAfterMinutes = totalFrames % (fps * 60);
  
  const secs = Math.floor(remainingFramesAfterMinutes / fps);
  const frames = remainingFramesAfterMinutes % fps;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
};
