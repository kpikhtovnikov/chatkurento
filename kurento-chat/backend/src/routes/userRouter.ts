import events from '../constants/events';

import SocketRouter from '../utils/SocketRouter';
import userService from '../services/userService';

const socketRouter = new SocketRouter('userRouter');

socketRouter.addEvent(events.userRouter.join, async (io, socket, data: object) => {
   const success = userService.add(socket.id, data);

   return { success, usersAmount: userService.getUsersAmount() };
});

export default socketRouter;
