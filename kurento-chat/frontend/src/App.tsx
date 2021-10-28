import { useContext } from 'react';

import Login from './components/Login';
import Room from './components/Room';

import { LoginContext } from './context/LoginContext';
import { VideoChatContextProvider } from './context/VideoChatContext';

function App() {
   const { state: loginState } = useContext(LoginContext);

   return loginState.isLoggedIn ? (
      <VideoChatContextProvider>
         <Room />
      </VideoChatContextProvider>
   ) : (
      <Login />
   );
}

export default App;
