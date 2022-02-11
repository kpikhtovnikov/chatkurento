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

      console.log(events)

      this.routers = [];

      this.io.on(events.connection, (socket: any) => {
         // console.log(events.connection)
         this.routers.forEach((router) => {
            const events = router.getEvents();
            // console.log(events.connection)

            events.forEach(([eventName, event]) => {
               // console.log([eventName, event])
               socket.on(
                  `${router.route}:${eventName}`,
                  async (data: any, onResult: (result: any) => void) => {
                     try {
                        onResult(await event(this.io, socket, data));
                        // console.log(this.io)
                        // console.log(socket)
                        // console.log(data)
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
