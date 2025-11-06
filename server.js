const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('New player connected: ' + socket.id);

    players[socket.id] = { x: 0, y: 0, z: 0, hp: 100 };

    // Sende alle Spieler an den neuen Spieler
    socket.emit('currentPlayers', players);

    // Informiere andere über den neuen Spieler
    socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

    // Spielerbewegung
    socket.on('move', (data) => {
        players[socket.id] = data;
        socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
    });

    // Spieler trennt Verbindung
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
