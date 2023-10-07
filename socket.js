import { Server } from 'socket.io';
let io;

const webSocket = {
    init: httpServer => {
       io = new Server(httpServer);
       return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not init.');
        }
        return io;
    }
};  

export default webSocket;