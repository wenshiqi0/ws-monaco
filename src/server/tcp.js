import net from 'net';

let port = 12345;
let server;
// global.sockets = [];
global.socket;

export default function initServer(callback) {
    if (!server) {
        console.log('start server');        
        server = net.createServer((socket) => {
            callback(socket);
            global.socket = socket;
        })
        server.listen(port);
    }
}