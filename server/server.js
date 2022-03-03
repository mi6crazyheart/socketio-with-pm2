const { createServer } = require("http");
const { Server } = require("socket.io");
const moment = require('moment');
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://127.0.0.1:8000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.adapter(createAdapter());

setupWorker(io);

let usersInOnline = [];

io.on("connection", (socket) => {

    // when user join the server
    socket.on('userJoinRoom', (data) => {
        let userName = data.userName;
        let roomID = data.roomID;
        let userID = data.userID;

        socket.join(roomID);

        let botMsgObj = {
            userName: 'Bot',
            userImg: 'bot.png',
            userMsg: "Welcome to Chat Server",
            dateTime: moment().format('h:mm A')
        };
        socket.emit('botMsg', botMsgObj);

        let userData = {
            id: socket.id,
            userName: userName,
            roomID: roomID,
            userID: userID,
            pimg: `${userID}.png`
        };
        usersInOnline.push(userData);
        io.emit('usersInOnline', usersInOnline);

        botMsgObj = {
            userName: 'Bot',
            userImg: 'bot.png',
            userMsg: `"${userName}" has joined the room`,
            dateTime: moment().format('h:mm A')
        };
        socket.broadcast.to(roomID).emit('botMsg', botMsgObj);
    });

    // when received user message
    socket.on('msgSent', (data) => {
        let userID = data.userID;
        let userName = data.userName;
        let userImg = data.userImg;
        let roomID = data.roomID;
        let userMsg = data.userMsg;
        let dateTime = moment().format('h:mm A');

        socket.join(roomID);

        let msgObj = { userID, userName, userImg, userMsg, dateTime };
        socket.broadcast.to(roomID).emit('userMsg', msgObj);
    });

    // when user left chat room
    socket.on('disconnect', () => {
        let newUserList = [];
        let userName = '';
        let roomID = '';
        usersInOnline.forEach((user) => {
            if (user.id != socket.id) {
                newUserList.push(user);
            } else {
                userName = user.userName;
                roomID = user.roomID;
            }
        });
        usersInOnline = newUserList;
        io.emit('usersInOnline', usersInOnline);

        botMsgObj = {
            userName: 'Bot',
            userImg: 'bot.png',
            userMsg: `"${userName}" has left the room`,
            dateTime: moment().format('h:mm A')
        };
        socket.broadcast.to(roomID).emit('botMsg', botMsgObj);
    });
});

// httpServer.listen(3000);