/*
 *
 */

import app from './app';
import http from 'http';
// import {Server} from "node:net";
import routers from './routes';
import {env} from './helpers';
import {Server} from "socket.io";
import {NextFunction, Request, Response} from "express";

const port: string = env('PORT', '9000');

routers(app);

const server: http.Server = http.createServer(app);
const io: Server = new Server(server, {cors: {origin: "*"}});

app.use((request: Request, response: Response, next: NextFunction) => {
  request['io'] = io;
  return next();
})

io.on('connection', (socket): void => {
  console.log('Socket connection is establish');
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

server.listen(port, () => {
  console.log(env('DATABASE_URL'));
  console.log(`express app is working at http://${'127.0.0.1'}:${port}`);
  console.log(`express app is working at http://${'admin.127.0.0.1'}:${port}`);
});
