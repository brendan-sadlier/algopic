import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
export const socket = socketIOClient(ENDPOINT);