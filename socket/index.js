import {Server} from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000'
    }
})

let users = [];

const addUser = (userData, socketId) => {
    !users.some(user => user?._id === userData?._id) && users.push({...userData, socketId});
}

io.on('connection', (socket) => {

    console.log('Connected:', socket.id);

    socket.on('addUsers', userData => {
        addUser(userData, socket.id);
        console.log('Users:', users);
        io.emit('getUsers', users);
    })

    socket.on('sendMessage', data=>{
        const user = users.find(user => user._id === data.receiverId);
        console.log('User:', user);
        console.log('Data:', data);
        io.emit('getMessage', data);
    })
});