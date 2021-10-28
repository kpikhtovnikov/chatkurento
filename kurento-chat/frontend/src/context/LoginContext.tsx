import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { ILoginContext } from '../types/loginTypes';

const defaultState: ILoginContext = {
   state: {
      onlineUsers: 0,
      isLoggedIn: false,
   },
   actions: {},
};

export const LoginContext = React.createContext(defaultState);

export const LoginContextProvider = ({ children }: any) => {
   const [onlineUsers, setOnlineUsers] = useState(0);
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   const state = {
      onlineUsers,
      isLoggedIn,
   };

   const actions = {
      setOnlineUsers,
      setIsLoggedIn,
   };

   useEffect(() => {
      socket.on('userRouter:getOnlineUsers', (data: any) => {
         setOnlineUsers(data);
      });
   }, [onlineUsers]);

   return (
      <LoginContext.Provider value={{ state, actions }}>
         {children}
      </LoginContext.Provider>
   );
};
