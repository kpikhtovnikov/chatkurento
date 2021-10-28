import kurentoClient from 'kurento-client';
import { getIceServersForKurento } from './IceServersProvider';
const IceCandidate = kurentoClient.getComplexType('IceCandidate');

class VideoStream {
   callId: string;
   endpoint: any;

   constructor(data: any) {
      this.callId = data.callId;
      this.endpoint = data.endpoint;
      this.endpoint.on('OnIceCandidate', async (event: any) => {
         data.onIceCandidate(event.candidate);
      });
   }

   processOffer = async (offer: any) => {
      return await this.endpoint.processOffer(offer);
   };

   gatherCandidates = async () => {
      return await this.endpoint.gatherCandidates();
   };

   configureEndpoint = async () => {
      const iceServers = await getIceServersForKurento();
      await this.endpoint.setTurnUrl(iceServers.turn);
      await this.endpoint.setStunServerAddress(iceServers.stun.ip);
      await this.endpoint.setStunServerPort(iceServers.stun.port);
   };

   addCandidates = (candidates: any[]) => {
      candidates.forEach((c) => this.addCandidate(c));
   };

   addCandidate = async (candidate: any) => {
      await this.endpoint.addIceCandidate(IceCandidate(candidate));
   };
}

export default VideoStream;
