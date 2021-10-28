import React, { useEffect, useRef } from 'react';
import style from './Room.module.css';

export default function UserVideo({ stream, isMyStream }: any) {
   const videoRef: any = useRef();

   useEffect(() => {
      if (!videoRef.current) {
         return;
      }

      videoRef.current.srcObject = stream;
      videoRef.current.muted = isMyStream;
      videoRef.current.play();
   }, [stream, videoRef, isMyStream]);

   return (
      <video
         className={style.userVideo}
         ref={videoRef}
         preload="none"
         playsInline
         autoPlay
         muted
      ></video>
   );
}
