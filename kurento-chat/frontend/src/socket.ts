import io from "socket.io-client";
import { configSettings } from './config/index'

const socket = io(configSettings.server);

export default socket;
