const express = require('express');
const app = express();
const server = require('http').Server(app);
const { Server } = require("socket.io");

const io = new Server(server);
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug:true 
})

console.log(__dirname);
app.use(express.static('public'));

app.use('/peerjs', peerServer);

const {v4 : uuidv4} = require('uuid');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', {roomId : req.params.room});
})

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})
server.listen(process.env.PORT||3030);