import events from '../constants/events';
import userService from '../services/userService';
import { getIceServersForFrontend } from '../utils/IceServersProvider';

import SocketRouter from '../utils/SocketRouter';
import VideoService from '../utils/VideoService';

const socketRouter = new SocketRouter('videoChatRouter');
console.log(socketRouter)
const videoService = new VideoService();

socketRouter.addEvent(events.videoChat.iceCandidates, async (io, socket, data) => {
   console.log('1')
   const { candidate, callId } = data;
   await videoService.iceCandidate({ candidate, callId });
});

socketRouter.addEvent(events.videoChat.publish, async (io, socket, data) => {
   console.log('2')
   const result = await videoService.publish(socket, data);

   io.emit('videoChatRouter:state', userService.getUsers());
   return result;
});

socketRouter.addEvent(events.videoChat.view, async (io, socket, data) => {
   console.log('3')
   const { offer, streamCallId, publishCallId } = data;

   const result = await videoService.view(socket, { offer, streamCallId, publishCallId });
   return result;
});

socketRouter.addEvent(events.videoChat.state, async () => {
   console.log('4')
   return userService.getUsers();
});

socketRouter.addEvent(events.videoChat.iceServers, async () => {
   console.log('5')
   return getIceServersForFrontend();
});

socketRouter.addEvent(events.videoChat.stopView, async (io, socket, callId) => {
   console.log('6')
   const stream = userService.getUser(socket.id).viewStreams.find((s) => s.id === callId)

   if(!stream){
      return
   }
   
});

export default socketRouter;
