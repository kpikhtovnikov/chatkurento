import { configSettings } from '../config';
import WebRtcConnection from './WebRtcConnection';

class WebRtcController {
   connections: {[key: string]: WebRtcConnection};
   candidateQueue: any;

   constructor() {
      this.connections = {};
      this.candidateQueue = {};
   }

   getPublishConnection(id: any, type: any) {
      return Object.values(this.connections).find(
         (connection: any) => connection.user.id === id && connection.type === type,
      );
   }

   getViewConnections(id: any, type: any): WebRtcConnection[] {
      return Object.values(this.connections).filter(
         (connection: any) => connection.user.id === id && connection.type === type,
      );
   }

   addIceCandidate = async ({ candidate, callId }: any) => {
      const connection = this.connections[callId];

      if (connection?.sdpAnswerSet) {
         return await connection.addIceCandidate(candidate);
      }

      this.candidateQueue[callId] = this.candidateQueue[callId] || [];
      this.candidateQueue[callId].push(candidate);
   };

   addAnswer = async ({ answer, callId }: any) => {
      const connection = this.connections[callId];
      if(!connection) {
         return
      }
      await connection.addAnswer(answer);
      const candidateQueue = this.candidateQueue[callId];
      
      if (candidateQueue) {
         for (let i = 0; i < candidateQueue.length; i++) {
            await connection.addIceCandidate(candidateQueue[i]);
         }
         delete this.candidateQueue[callId];
      }
   };

   createPublishConnection = async (data: any) => {
      const connection = new WebRtcConnection({
         ...data,
         type: configSettings.connectionType.publish,
      });

      await connection.generateLocalStream();
      await connection.createPeerConnection();
      await connection.createOffer();

      this.connections[connection.callId] = connection;
   };

   createViewConnection = async (data: any) => {
      const connection = new WebRtcConnection({
         ...data,
         type: configSettings.connectionType.view,
      });

      await connection.createPeerConnection();
      await connection.createOffer();

      this.connections[connection.callId] = connection;
   };

   clearConnection = async (connection: WebRtcConnection) => {
      await connection.release();
      delete this.connections[connection.callId];
    }

   stopViewConnection = async (userId) => {
      const connections = this.getViewConnections(userId, "view");
      
      await Promise.all(connections.map((c) => {
         return this.clearConnection(c);
      }));
    }

}

export default WebRtcController;
