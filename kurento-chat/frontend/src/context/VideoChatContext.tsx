import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import socket from '../socket';
import socketRequest from '../utils/socketRequest';
import WebRtcController from '../utils/WebRtcController';
import {
   IVideoChatContext,
   ILocalStream,
   IStream,
   IUser,
} from '../types/videoChatTypes';

export const VideoChatContext = React.createContext<IVideoChatContext>(
   {} as IVideoChatContext
);

export const VideoChatContextProvider = (props: any) => {
   const [webRtcController] = useState(() => new WebRtcController());
   const [videoStreams, setVideoStreams] = useState<ILocalStream[]>([]);
   const [videoChatState, setVideoChatState] = useState<IUser[]>([]);

   const iceServersRef = useRef<any>(null);

   const listenCallEvents = async () => {
      if (!socket) return;

      socket.on('videoChatRouter:iceCandidates', onCallIceCandidate);

      await getIceServers();

      const callState = await socketRequest(socket, 'videoChatRouter:state');
      socket.on('videoChatRouter:state', (newCallState) => {
         onCallState(newCallState);
      });
      socket.on('videoChatRouter:leave', (userId) => {
         setVideoChatState((state) => {
            const streamToStop = state.find((s) => s.id === userId);
            if (!streamToStop) {
               return state;
            }
            stopViewStream(streamToStop);
            return state.filter((v) => v.id !== userId);
         });
      });
      onCallState(callState);
   };

   useEffect(() => {
      listenCallEvents();
   }, [socket]);

   const onCallIceCandidate = async (data: {
      candidate: RTCIceCandidate;
      callId: string;
   }) => {
      await webRtcController.addIceCandidate(data);
   };

   const onCallState = async (data: IUser[]) => {
      setVideoChatState(data);
   };

   const getIceServers = async () => {
      if (!socket) {
         return;
      }
      const iceServers = await socketRequest(
         socket,
         'videoChatRouter:iceServers'
      );
      iceServersRef.current = iceServers;
   };

   const onGotPublishOffer = async (offer: string, callId: string) => {
      const result = await socketRequest(socket, 'videoChatRouter:publish', {
         offer,
         callId,
      });
      webRtcController.addAnswer(result);
   };

   const onGotViewOffer = async (
      streamCallId: string,
      offer: string,
      callId: string
   ) => {
      const result = await socketRequest(socket, 'videoChatRouter:view', {
         streamCallId,
         offer,
         publishCallId: callId,
      });
      await webRtcController.addAnswer(result);
   };

   const onGotLocalCandidate = async (
      callId: string,
      candidate: RTCIceCandidate
   ) => {
      await socketRequest(socket, 'videoChatRouter:iceCandidates', {
         callId,
         candidate,
      });
   };

   const onGotUserStream = (videoChatMember: IUser, stream: MediaStream) => {
      setVideoStreams((streams) => [
         ...streams.filter((s) => s.id !== videoChatMember.id),
         {
            id: videoChatMember.id,
            name: videoChatMember.name,
            localStream: stream,
         },
      ]);
   };

   const viewStream = async (videoChatMember, stream) => {
      const callId = uuidv4() + '-view';

      await webRtcController.createViewConnection({
         callId,
         publishCallId: stream.callId,
         iceServers: iceServersRef.current,
         user: videoChatMember,
         onGotOffer: (offer, callId) =>
            onGotViewOffer(callId, offer, stream.callId),
         onGotCandidate: onGotLocalCandidate,
         onGotStream: (stream: MediaStream) =>
            onGotUserStream(videoChatMember, stream),
      });
   };

   const publishStream = async (videoChatMember: IUser) => {
      const callId = uuidv4() + '-publish';

      await webRtcController.createPublishConnection({
         callId,
         iceServers: iceServersRef.current,
         user: videoChatMember,
         onGotOffer: onGotPublishOffer,
         onGotCandidate: onGotLocalCandidate,
         onGotLocalStream: (stream: MediaStream) =>
            onGotUserStream(videoChatMember, stream),
         onIceConnectionStateDisconnected: (stream: MediaStream) =>
            restartPublsihStream(videoChatMember),
      });
   };

   const stopViewStream = async (videoChatMember: IUser) => {
      if (!socket) {
         return;
      }
      setVideoStreams((state) => {
         const filteredStreams: ILocalStream[] = state.filter(
            (s) => s.id !== videoChatMember.id
         );
         return [...filteredStreams];
      });
      const callId = await webRtcController.stopViewConnection(
         videoChatMember.id
      );
      await socketRequest(socket, 'videoChatRouter:stopView', { callId });
   };

   const restartPublsihStream = (videoChatMember: any) => {};

   useEffect(() => {
      processVideoChatState();
   }, [videoChatState]);

   const processVideoChatState = async () => {
      let allStreamsToView: any[] = [];
      for (let i = 0; i < videoChatState.length; i++) {
         const videoChatMember = videoChatState[i];

         if (socket.id === videoChatMember.id) {
            const publishConnection = webRtcController.getPublishConnection(
               videoChatMember.id,
               'publish'
            );
            if (!publishConnection) {
               await publishStream(videoChatMember);
            }
            continue;
         }

         const currentStreams = videoChatMember.streams || [];
         const localViewStreams = webRtcController.getViewConnections(
            videoChatMember.id,
            'view'
         );
         const streamsToRemove = _.differenceWith(
            localViewStreams,
            currentStreams,
            (a: IStream, b: IStream) => a.publishCallId === b.callId
         );

         const streamsToView = _.differenceWith(
            currentStreams,
            localViewStreams,
            (a: IStream, b: IStream) => a.callId === b.publishCallId
         );

         for (let j = 0; j < streamsToRemove.length; j++) {
            await stopViewStream(videoChatMember);
         }

         allStreamsToView = [
            ...allStreamsToView,
            { member: videoChatMember, streams: streamsToView },
         ];
      }

      allStreamsToView = allStreamsToView.filter((s) => s.streams.length);

      for (let i = 0; i < allStreamsToView.length; i++) {
         for (let j = 0; j < allStreamsToView[i].streams.length; j++) {
            await viewStream(
               allStreamsToView[i].member,
               allStreamsToView[i].streams[j]
            );
         }
      }
   };

   return (
      <VideoChatContext.Provider value={{ videoStreams, id: socket.id }}>
         {props.children}
      </VideoChatContext.Provider>
   );
};
