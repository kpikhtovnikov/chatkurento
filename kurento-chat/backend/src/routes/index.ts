import express from 'express';
import http from'http';
import cors from 'cors'

import config from '../config/index';
import SocketConnection from '../utils/SocketConnection';
import videoChatRouter from './videoChat';
import userRouter from './userRouter';


const initRouter = () => {
    const app = express();
    const port:number = config.PORT;
    
    app.use(cors({
       origin: '*'
    }));
    

    const server = http.createServer(app);
    const socketConnection = new SocketConnection(server);

    socketConnection.addRouter(videoChatRouter);
    socketConnection.addRouter(userRouter);


    server.listen(port, () => {
       console.log(`App listening at http://localhost:${port}`)
    });
};

module.exports = {
    initRouter,
};

