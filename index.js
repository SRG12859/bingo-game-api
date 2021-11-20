const io = require('socket.io')(3000, {
    cors: {
        origin: '*',
    }
}
)
io.on('connection', socket => {
  console.log('User Joined With:- ' + socket.id)

  var users_in_room = {
        user:[]
  };   

  // Joining User To a private bingo room
  socket.on('join-bingoGame-private', (room, username) => {
    socket.join(room);

    users_in_room.user.push({userId: socket.id, username, room, turn: false});

    console.log(users_in_room.user)

    socket.to(room).emit("user-joined", username, room);

    console.log("User Joined With Id: %s Has Connected To Room : %s With The username %s", socket.id, room, username);
  })
      

  socket.on('bingoGame_ch-turn_crossed', (room, checked) => {
    
    let same_room_user = [];

    for (const property in users_in_room.user) {
      same_room_user.push(property)
    }

    console.log(same_room_user.length );

    if (same_room_user.length < 1) {
      socket.to(room).emit("less-user", "There Are Less User To Start The Game")
    }
    else {
      // Random choice
      let turn;
      
      let turnNumber = 0;
      turn = same_room_user[turnNumber];
      
      console.log(turn);
      if (socket.id === turn.userId) {
        socket.to(room).emit('bingoGame_ch-turn_crossed', message)
        turn = same_room_user[same_room_user.length > turnNumber ? turnNumber++ : 0];
        console.log("TURNED")
      }
      else {
        io.emit("not-turn", "Wait For Your Turn")
      }
    }
  })

}
)