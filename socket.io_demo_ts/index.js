let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http)
let cors = require('cors')
let _ = require('lodash');

app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html')
})

//存储用户信息
let socketUser = []

io.on('connection', (socket) => {

    //把获取到的socketId传回给客户端，客户端自行存储，以后用来识别
    io.to(socket.id).emit('socketID', socket.id)

    //监听登录事件，当有用户触发时存储该用户的信息
    socket.on('signIn', (userData) => {
        socketUser.push(userData)
        io.emit('broadcast', `welcome ${userData.nickName}`, socketUser);
        return;
    })
    //监听登出事件，当有用户触发时，移除该用户的信息,并发出公告提示
    socket.on('signOut', (userData) => {
        //通过id来判断是否需要移除
        socketUser = _.remove(socketUser, (value) => {
            return value.id != userData.id
        })
        io.emit('broadcast', `${userData.nickName} is leave`, socketUser)
        return;
    })
    //当有用户断开连接时
    socket.on('disconnect', () => {
        return;
    })
    //监听公共聊天事件，当有用户发起对话时，除发出对话之外的其他所有用户都能收到
    socket.on('globalChat', (msg) => {
        socket.broadcast.emit('globalChat', msg);
        return;
    })
    //监听正在输入事件，当有用户正在输入时，除输入的用户之外的其他所有用户都能收到
    socket.on('typing', (nickName) => {
        socket.broadcast.emit('typing', nickName)
        return;
    })

    //监听私密聊天事件，当有用户发起私密对话时，只有指定用户才能接收到
    socket.on('privateChat', (data) => {
        io.to(data.privateTarget.id).emit('privateChat', data)
        return;
    })
})

http.listen('3000', () => {
    console.log('express listen on 3000')
})