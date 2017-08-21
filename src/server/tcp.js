import net from 'net';

let port = process.env.serverPort || 10005;
let server;
// global.sockets = [];
global.socket;

export default function initServer(callback) {
    if (!server) {
        console.log('start server on ', port);        
        server = net.createServer((socket) => {
            console.log('new connection');
            callback(socket);
            global.socket = socket;
        })
        server.on('close', () => {
            console.log('server closed');
        })
        server.listen(port);
    }
}

process.on('exit', () => {
    server.close();
})