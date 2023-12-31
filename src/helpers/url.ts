import {Request} from 'express';

export const baseURL = (request: Request) => {
  const protocol = request.protocol; // 'http' or 'https'
  const host: string = request.get('host');
  // let host: string = request.socket.localAddress.replace('::ffff:', '');

  // let port: string = request.socket.localPort.toString();
  // if (port !== '80' && port !== '443')
  //   host += ':' + port;
  //
  // console.log(request.socket.localPort, request.socket.localAddress)

  // return `${protocol}://${host}`;
  return `${protocol}://${host}`;
};