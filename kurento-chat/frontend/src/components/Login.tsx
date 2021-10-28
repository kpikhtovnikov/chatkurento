import { useState, useContext } from 'react';
import { Typography, TextField, Button, Container, Alert } from '@mui/material';

import { events } from '../constants/events';
import socket from '../socket';
import { LoginContext } from '../context/LoginContext';
import socketRequest from '../utils/socketRequest';
import style from './Login.module.css';

export default function Login() {
   const { actions: loginActions } = useContext(LoginContext);

   const [userName, setUsername] = useState('');
   const [canEnterChat, setCanEnterChat] = useState(true);

   const joinRoom = async () => {
      let { success, usersAmount } = await socketRequest(
         socket,
         events.userRouter.join,
         { userName }
      );
      setCanEnterChat(success);
      if (success) {
         loginActions.setIsLoggedIn(true);
         return;
      }
   };

   const changeUserNameHandler = (event: any) => {
      setUsername(event.target.value);
   };

   const keyDownHandler = (event: any) => {
      if (event.key === 'Enter') {
         joinRoom();
      }
   };

   return canEnterChat ? (
      <div>
         <Typography variant="h4" className={style.heading}>
            Enter your name to join chat
         </Typography>
         <Container className={style.formContainer} maxWidth="sm">
            <TextField
               id="outlined-basic"
               label="Name"
               variant="outlined"
               onChange={changeUserNameHandler}
               onKeyDown={keyDownHandler}
            />
            <Button variant="outlined" onClick={joinRoom}>
               Submit
            </Button>
         </Container>
      </div>
   ) : (
      <Alert className={style.alert} severity="error">
         The room is full now. Please try again later.
      </Alert>
   );
}
