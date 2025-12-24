import { Server, Socket } from 'socket.io';

export const initSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-project', (projectId: string) => {
      console.log(`Socket ${socket.id} joining project: ${projectId}`);
      socket.join(projectId);
    });

    socket.on('project-update', ({ projectId, delta }: { projectId: string; delta: any }) => {
      socket.to(projectId).emit('project-update', delta);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
