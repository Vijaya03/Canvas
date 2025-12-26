const WebSocket = require('ws');
const wss = new WebSocket.Server({port:8080});
const rooms = new Map();
wss.on('connection',(socket)=>{
    console.log('Client connected');
    socket.on('message',(raw)=>{
        const message = JSON.parse(raw.toString());
        // Join Room
        if(message.type === 'JOIN_ROOM'){
            const {roomId} = message;
            socket.roomId = roomId
            if(!rooms.has(roomId)){
                rooms.set(roomId, new Set())
            }
            rooms.get(roomId).add(socket);
            return;
        }

        // draw event
        if(message.type === 'DRAW'){
            const {x,y} = message;
            const roomId = socket.roomId;
            if(!roomId) return;

            rooms.get(roomId)?.forEach((client)=>{
                if(client!== socket && client.readyState === WebSocket.OPEN){
                client.send(raw.toString());
            }
        })
        }
    })

    socket.on('close',()=>{
        console.log('Client disconnected');
        const roomId = socket.roomId;
        if(roomId && rooms.has(roomId)){
            rooms.get(roomId).delete(socket);
            if(rooms.get(roomId).size ===0){
                rooms.delete(roomId)
            }
        }
    })
})

console.log('WebSocket server is running on ws://localhost:8080');