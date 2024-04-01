import socketIOClient from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const socket = socketIOClient(ENDPOINT, {
  transports: ['websocket'],
  withCredentials: true,
});