const io = require('socket.io')(process.env.PORT || 3000, {
	cors: {
		origin: "*",
	}
})

io.on('connection', ( socket ) => {
	console.log('User Joined With:- ' + socket.id);

	// Stores The Room And Users
	var users_and_room = {
		user: [],
		room: []
	};

	// Find Any Public Bingo Game
	socket.on("public-bingo-game", (socket) => {
		// Adding an array which will store all the public data
		let publicRooms = [];

		// Iterating Trough Every Index
		for (let roomIndex = 0; roomIndex < users_and_room.room; roomIndex++) {
			// element of current index
			let room = users_and_room.room[roomIndex];

			if (room.public === true) {
				publicRooms.push(room);
			}
		}

		// Sharing the public room to The user
		socket.emit("public-bingo-game", publicRooms);
	})

	// Joining User To A Public Lobby bingo room
	socket.on('join-bingoGame-public', (username) => {
		let room = room;
		// If There is no entry for the 
		if (room === "" || room === undefined || room === null) {
			room = "public";
		}
		
		socket.join(room);

		users_and_room.user.push({ userId: socket.id, username, room });

		// Adding That There is a room in use
		users_and_room.room.push({ room, anyHost: false, public: true });

		console.log(users_and_room.user);

		socket.to(room).emit("user-joined", username, room);

		console.log("User Joined With Id: %s Has Connected To Room : %s With The username %s", socket.id, room, username);
	})

	// Joining User To a private bingo room
	socket.on('join-bingoGame-private', (room, username) => {
		socket.join(room);

		// Adding that there is a user in socket
		users_and_room.user.push({ userId: socket.id, username, room });

		// Adding That There is a room in use
		users_and_room.room.push({ room, hostId: socket.id, hostUsername: username, anyHost: true, public: false, official: false });

		console.log(users_and_room.user);
		console.log(users_and_room.room);

		socket.to(room).emit("user-joined", username, room);

		console.log("User Joined With Id: %s Has Connected To Room : %s With The username %s", socket.id, room, username);
	})

	// This will Change The Turn For The User And Send A Record To The Other
	socket.on('bingoGame_ch-turn_crossed', (room, checked) => {

		let same_room_user = [];

		for (let userIndex = 0; userIndex < users_and_room.user.length; userIndex++) {
			let user = users_and_room.user[userIndex];
			same_room_user.push(user);
		}

		if (same_room_user.length < 1) {
			socket.to(room).emit("less-user", "There Are Less User To Start The Game")
		}
		else {
			// Random choice
			let turn;

			let turnNumber = 0;
			let randomNum = same_room_user[Math.floor(Math.random() *
				same_room_user.length)];

			// Setting a random number so player will have intense situation and will be fun to play
			turn = randomNum;

			// Log out The Turn 
			console.log(turn);

			// Alerting Everyone that who's turn is this...
			socket.to(turn.room).emit("whos-turn", `Hey, Its Your Turn ${turn.username}`);

			// sending a socket.emit() to alert the user for the turn
			socket.to(turn.userId).emit("your-turn", "Hey, Its Your Turn");

			// Checking The user for its the 
			if (socket.id === turn.userId) {
				socket.to(room).emit('bingoGame_ch-turn_crossed', checked);
				console.log("TURNED");
				turn = same_room_user[same_room_user.length > turnNumber ? turnNumber++ : 0];
			}
			else {
				socket.to(socket.id).emit("not-turn", "Wait For Your Turn");
			}
		}
	});

	// If Anyone Disconnects from The socket remove it from the array 
	socket.on("disconnect", (socket) => {
		users_and_room.user.filter(user => {
			if(user.userId === socket.id) console.log(`User disconnected With id : ${user.userId} and UserName : ${user.username}`)
			user.userId !== socket.id
		});

		
	});
}
)