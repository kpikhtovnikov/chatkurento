import http from 'http';

import events from '../constants/events';
import config from '../config';

import SocketRouter from './SocketRouter';
import userService from '../services/userService';
import { SSL_OP_NO_TICKET } from 'constants';

const socket = require('socket.io');

class SocketConnection {
   io: any;
   routers: SocketRouter[];

   constructor(server: http.Server) {
      this.io = socket(server, {
         cors: {
            origin: '*',
         },
      });

      this.routers = [];

      this.io.on(events.connection, (socket: any) => {

         this.routers.forEach((router) => {
            const events = router.getEvents();

            events.forEach(([eventName, event]) => {
               socket.on(
                  `${router.route}:${eventName}`,
                  async (data: any, onResult: (result: any) => void) => {
                     try {
                        onResult(await event(this.io, socket, data));
                     } catch (e) {
                        console.error(`error on ${router.route}:${eventName}: `);
                        console.error(e);
                        onResult({ error: true });
                     }
                  },
               );
            });
         });

         socket.on(events.disconnect, () => {
            userService.remove(socket.id);
            this.io.emit('videoChatRouter:leave', socket.id);
         });
      });
   }

   addRouter(router: SocketRouter) {
      this.routers.push(router);
   }
}

export default SocketConnection;
