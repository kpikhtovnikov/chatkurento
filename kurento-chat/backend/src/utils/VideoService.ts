import Kurento from './Kurento';
import VideoStream from './VideoStream';
import userService from '../services/userService';

class VideoService {
   videoStreams: Array<VideoStream>;
   candidateQueue: any[];

   constructor() {
      this.videoStreams = [];
      this.candidateQueue = [];
   }

   createUserStream = async (socket: any, { callId, offer }: any) => {
      const pipeline = await Kurento.getOrCreatePipeline();
      const endpoint = await Kurento.createWebrtcEndpoint(pipeline);

      const videoStream = new VideoStream({
         callId,
         endpoint,
         onIceCandidate: (candidate: any) => {
            socket.emit('videoChatRouter:iceCandidates', { candidate, callId });
         },
      });

      await videoStream.configureEndpoint();

      this.videoStreams[callId] = videoStream;

      if (this.candidateQueue[callId]) {
         videoStream.addCandidates(this.candidateQueue[callId]);
         delete this.candidateQueue[callId];
      }

      const answer = await videoStream.processOffer(offer);
      await videoStream.gatherCandidates();

      return {
         videoStream,
         answer,
      };
   };

   publish = async (socket: any, { callId, offer }: any) => {
      const { videoStream, answer } = await this.createUserStream(socket, { callId, offer });
      userService.addPublishStream(socket.id, videoStream);

      return { answer, callId };
   };

   view = async (socket: any, { offer, streamCallId: callId, publishCallId }: any) => {
      const publishStream = this.videoStreams[publishCallId];
      if (!publishStream) {
         throw { message: 'invalid call id' };
      }

      const { videoStream, answer } = await this.createUserStream(socket, { callId, offer });

      userService.addViewStream(socket.id, videoStream);

      await publishStream.endpoint.connect(videoStream.endpoint);

      return { answer, callId };
   };

   iceCandidate = async ({ candidate, callId }: any) => {
      const videoStream = this.videoStreams[callId];

      if (videoStream) {
         await videoStream.addCandidate(candidate);
      }

      this.candidateQueue[callId] = this.candidateQueue[callId] || [];
      this.candidateQueue[callId].push(candidate);
   };
}

export default VideoService;
