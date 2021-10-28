import { Container, Grid } from '@mui/material';
import React, { useContext } from 'react';

import style from './Room.module.css';
import UserVideo from './UserVideo';

import { VideoChatContext } from '../context/VideoChatContext';

export default function Room() {
   const { videoStreams } = useContext(VideoChatContext);

   return (
      <Container max-width="lg">
         <h1>Video Chat</h1>
         <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
            {videoStreams.map((stream) => (
               <Grid item xs={12} sm={6} key={stream.localStream.id}>
                  <UserVideo stream={stream.localStream} />
               </Grid>
            ))}
         </Grid>
      </Container>
   );
}
