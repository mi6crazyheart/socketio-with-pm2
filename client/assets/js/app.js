
// var socket = io('http://localhost:3000');
var socket = io('http://localhost:8080', {
    transports: ["websocket"],
    withCredentials: true
});

const urlParams = new URL(location.href);
const rid = urlParams.searchParams.get('rid');
const rname = urlParams.searchParams.get('rname');
const uid = urlParams.searchParams.get('uid');

users = [
    {
        id: 1,
        name: 'Tom Alter',
        pimg: '1.png'
    },
    {
        id: 2,
        name: 'Sharon Lessman',
        pimg: '2.png'
    },
    {
        id: 3,
        name: 'Fiona Green',
        pimg: '3.png'
    }
];

var app = new Vue({
    el: '#app',
    data: {
        roomID: false,
        roomName: false,
        loginUserID: parseInt(uid),
        loginUserImg: '',
        loginUserData: [],
        usersInOnline: [],
        userMsg: '',
        chats: []
    },
    methods: {
        sendUserMsg(e) {
            let userMsg = this.userMsg;
            this.userMsg = '';

            let userID = this.loginUserData[0].id;
            let userName = this.loginUserData[0].name;
            let userImg = this.loginUserData[0].pimg;
            let roomID = rid;
            let roomName = rname;
            let msgObj = { userID, userName, userImg, userMsg, roomID, roomName };
            socket.emit('msgSent', msgObj);

            let dateTime = moment().format('h:mm A');
            let totalMsgs = this.chats.length;
            let userMsgObj = {
                id: totalMsgs++,
                fromID: userID,
                fromName: userName,
                pimg: userImg,
                msg: userMsg,
                dateTime: dateTime
            };
            this.chats.push(userMsgObj);
        },
    },
    mounted: function () {
        const user = users.filter(user => user.id === parseInt(uid));

        this.loginUserData = user;
        this.loginUserImg = user[0].pimg;
        let roomData = {
            userName: user[0].name,
            userID: this.loginUserID,
            roomID: rid,
        };

        socket.emit('userJoinRoom', roomData);

        socket.on('botMsg', (data) => {
            let userName = data.userName;
            let userMsg = data.userMsg;
            let userImg = data.userImg;
            let dateTime = data.dateTime;

            let totalMsgs = this.chats.length;

            let botMsg = {
                id: totalMsgs++,
                fromID: 0,
                fromName: userName,
                pimg: userImg,
                msg: userMsg,
                dateTime: dateTime
            };
            this.chats.push(botMsg);
        });

        socket.on('usersInOnline', (data) => {
            this.usersInOnline = data;
        });

        socket.on('userMsg', (data) => {
            let userID = data.userID;
            let userName = data.userName;
            let userMsg = data.userMsg;
            let userImg = data.userImg;
            let dateTime = data.dateTime;

            let totalMsgs = this.chats.length;

            let msg = {
                id: totalMsgs++,
                fromID: userID,
                fromName: userName,
                pimg: userImg,
                msg: userMsg,
                dateTime: dateTime
            };
            this.chats.push(msg);
        });
    }
})