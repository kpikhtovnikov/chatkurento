import events from '../constants/events';
import userService from '../services/userService';
import { getIceServersForFrontend } from '../utils/IceServersProvider';

import SocketRouter from '../utils/SocketRouter';
import VideoService from '../utils/VideoService';

const socketRouter = new SocketRouter('videoChatRouter');
const videoService = new VideoService();

socketRouter.addEvent(events.videoChat.iceCandidates, async (io, socket, data) => {
   const { candidate, callId } = data;
   await videoService.iceCandidate({ candidate, callId });
});

socketRouter.addEvent(events.videoChat.publish, async (io, socket, data) => {
   const result = await videoService.publish(socket, data);

   io.emit('videoChatRouter:state', userService.getUsers());
   return result;
});

socketRouter.addEvent(events.videoChat.view, async (io, socket, data) => {
   const { offer, streamCallId, publishCallId } = data;

   const result = await videoService.view(socket, { offer, streamCallId, publishCallId });
   return result;
});

socketRouter.addEvent(events.videoChat.state, async () => {
   return userService.getUsers();
});

socketRouter.addEvent(events.videoChat.iceServers, async () => {
   return getIceServersForFrontend();
});

socketRouter.addEvent(events.videoChat.stopView, async (io, socket, callId) => {
   const stream = userService.getUser(socket.id).viewStreams.find((s) => s.id === callId)

   if(!stream){
      return
   }
   
});

export default socketRouter;
