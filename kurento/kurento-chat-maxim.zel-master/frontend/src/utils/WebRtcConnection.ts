import { configSettings } from '../config';
import { IUser } from '../types/videoChatTypes';
class WebRtcConnection {
   callId: string;
   publishCallId?: string;
   type: string;
   iceServers: any;
   peerConnection: RTCPeerConnection | undefined;
   sdpAnswerSet: boolean;
   user: IUser;

   localStream: any;
   stream: any;
   onGotLocalStream: any;
   onGotStream: any;
   onGotOffer: any;
   onGotCandidate: any;

   constructor(data: any) {
      //TODO исправить тип
      this.peerConnection = undefined;

      this.callId = data.callId;
      this.publishCallId = data.publishCallId;
      this.type = data.type;
      this.iceServers = data.iceServers;
      this.user = data.user;
      this.sdpAnswerSet = false;

      this.localStream = null;
      this.stream = null;
      this.onGotLocalStream = data.onGotLocalStream;
      this.onGotStream = data.onGotStream;
      this.onGotOffer = data.onGotOffer;
      this.onGotCandidate = data.onGotCandidate;
   }

   createPeerConnection = async () => {
      this.peerConnection = new RTCPeerConnection({
         iceServers: this.iceServers,
      });

      this.peerConnection.onicecandidateerror = (e) => {
         console.error('onicecandidateerror: ', e);
      };

      this.peerConnection.onicecandidate = (e) => {
         e.candidate && this.onGotCandidate(this.callId, e.candidate);
      };

      if (this.type === configSettings.connectionType.view) {
         this.peerConnection.ontrack = (e: any) => {
            this.stream = this.stream || new MediaStream();
            this.stream.addTrack(e.track);
            this.onGotStream(this.stream);
         };
      }
   };

   generateLocalStream = async () => {
      const constraints = this.getConstraints();
      this.localStream = await this.getUserMedia(constraints);
      if (!this.localStream){
         console.log('no localStream', this.localStream)
      }
      this.onGotLocalStream?.(this.localStream);
   };

   getUserMedia = async (constraints: object) => {
      try {
         console.log(constraints)
         return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
         console.warn('getUserMedia error: ', e);
      }
   };

   getConstraints() {
      return {
         video: true,
         audio: true
      };
   }

   createOffer = async () => {
      if (this.localStream) {
         for (const track of this.localStream.getTracks()) {
            this.peerConnection?.addTrack(track);
         }
      }

      // console.log(this.peerConnection, 'peerConnection')

      const offer = await this.peerConnection?.createOffer({offerToReceiveVideo: true, offerToReceiveAudio: true});

      await this.peerConnection?.setLocalDescription(offer);
      this.onGotOffer?.(offer?.sdp, this.callId);
      console.log(this.peerConnection, 'peerConnection')
   };

   addAnswer = async (sdp: any) => {
      const answer = new RTCSessionDescription({ type: 'answer', sdp });
      await this.peerConnection?.setRemoteDescription(answer);
      this.sdpAnswerSet = true;
   };

   addIceCandidate = async (candidate: any) => {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
   };

   release = () => {
      this.peerConnection?.close()
   }
}

export default WebRtcConnection;
