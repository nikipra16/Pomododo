const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
    cors: {
        origin: [
            "http://localhost:5173", "http://localhost:5173/Pomododo", 
            "http://localhost:5174", "http://localhost:5174/Pomododo", 
            "http://localhost:5175", "http://localhost:5175/Pomododo", 
            "http://localhost:5176", "http://localhost:5176/Pomododo",
            "http://localhost:5177", "http://localhost:5177/Pomododo",
            "http://localhost:5178", "http://localhost:5178/Pomododo",
            "https://nikitap.github.io", "https://nikitap.github.io/Pomododo",
            "https://nikipra16.github.io", "https://nikipra16.github.io/Pomododo",
            "https://pomododo-production.up.railway.app",
            "null"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173", "http://localhost:5173/Pomododo", 
        "http://localhost:5174", "http://localhost:5174/Pomododo", 
        "http://localhost:5175", "http://localhost:5175/Pomododo", 
        "http://localhost:5176", "http://localhost:5176/Pomododo",
        "http://localhost:5177", "http://localhost:5177/Pomododo",
        "http://localhost:5178", "http://localhost:5178/Pomododo",
        "https://nikitap.github.io", "https://nikitap.github.io/Pomododo",
        "https://nikipra16.github.io", "https://nikipra16.github.io/Pomododo",
        "https://pomododo-production.up.railway.app",
        "null"
    ],
    credentials: true
}));
app.use(express.json());

// In-memory storage for rooms (will be replaced with database later)
const rooms = new Map();
const roomCodes = new Map(); // roomCode -> roomId mapping
const userSockets = new Map(); // userId -> socket.id mapping

// Generate unique room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Basic routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Study Room WebSocket Server', 
        status: 'running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        rooms: rooms.size,
        users: userSockets.size,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Simple ping endpoint for Railway health checks
app.get('/ping', (req, res) => {
    res.json({ pong: true, timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle room creation
    socket.on('create-room', (data) => {
        try {
            const { userId, userName, maxCapacity = 5 } = data;

            if (!userId || !userName) {
                socket.emit('error', { message: 'User ID and name are required' });
                return;
            }

            // Check if user is already in a room
            if (userSockets.has(userId)) {
                socket.emit('error', { message: 'You are already in a room' });
                return;
            }

            // Generate unique room code
            let roomCode;
            do {
                roomCode = generateRoomCode();
            } while (roomCodes.has(roomCode));

            const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create room
            const room = {
                id: roomId,
                code: roomCode,
                hostId: userId,
                hostName: userName,
                attendees: new Map([[userId, { name: userName, joinedAt: new Date(), isHost: true }]]),
                maxCapacity,
                createdAt: new Date(),
                status: 'active'
            };

           
            rooms.set(roomId, room);
            roomCodes.set(roomCode, roomId);
            userSockets.set(userId, socket.id);

            // Join the Socket.io room
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;

            console.log(`Room created: ${roomCode} by ${userName}`);
            console.log('Checking userSockets for userId:', userId);
            console.log('userSockets has userId:', userSockets.has(userId));
            console.log('Current userSockets:', Array.from(userSockets.keys()));

            socket.emit('room-created', {
                roomId,
                roomCode,
                room: {
                    id: room.id,
                    code: room.code,
                    hostName: room.hostName,
                    attendees: Array.from(room.attendees.values()),
                    maxCapacity: room.maxCapacity,
                    createdAt: room.createdAt
                }
            });

        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('error', { message: 'Failed to create room' });
        }
    });

    // Handle joining a room
    socket.on('join-room', (data) => {
        try {
            const { roomCode, userId, userName } = data;

            if (!roomCode || !userId || !userName) {
                socket.emit('error', { message: 'Room code, user ID, and name are required' });
                return;
            }

            // Check if user is already in a room
            if (userSockets.has(userId)) {
                socket.emit('error', { message: 'You are already in a room' });
                return;
            }

            const roomId = roomCodes.get(roomCode);
            if (!roomId) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const room = rooms.get(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            if (room.status !== 'active') {
                socket.emit('error', { message: 'Room is not active' });
                return;
            }

                  if (room.attendees.size >= room.maxCapacity) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Check if user is already in this specific room
      console.log('=== JOIN ROOM DEBUG ===');
      console.log('User ID:', userId);
      console.log('Room ID:', roomId);
      console.log('Room attendees:', Array.from(room.attendees.keys()));
      console.log('User already in room:', room.attendees.has(userId));
      console.log('--- MAPS STATE ---');
      console.log('userSockets Map:', Array.from(userSockets.entries()));
      console.log('rooms Map keys:', Array.from(rooms.keys()));
      console.log('roomCodes Map:', Array.from(roomCodes.entries()));
      console.log('Current room attendees Map:', Array.from(room.attendees.entries()));
      console.log('========================');
      
      if (room.attendees.has(userId)) {
        console.log('BLOCKING: User already in this room');
        socket.emit('error', { message: 'You are already in this room' });
        return;
      }

      // Add user to room
            room.attendees.set(userId, {
                name: userName,
                joinedAt: new Date(),
                isHost: false
            });

            userSockets.set(userId, socket.id);

            // Join the Socket.io room
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;

            console.log(`${userName} joined room: ${roomCode}`);

            // Notify all users in the room using Socket.io room broadcasting
            io.to(roomId).emit('user-joined', {
                userId,
                userName,
                attendees: Array.from(room.attendees.values())
            });

            // Send room info to the joining user
            socket.emit('room-joined', {
                roomId,
                room: {
                    id: room.id,
                    code: room.code,
                    hostName: room.hostName,
                    attendees: Array.from(room.attendees.values()),
                    maxCapacity: room.maxCapacity,
                    createdAt: room.createdAt
                }
            });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    // Handle leaving a room
    socket.on('leave-room', () => {
        try {
            if (!socket.roomId || !socket.userId) {
                return;
            }

            const room = rooms.get(socket.roomId);
            if (!room) {
                return;
            }

            const user = room.attendees.get(socket.userId);
            if (!user) {
                return;
            }

            const isHost = room.hostId === socket.userId;

            // Remove user from room
            room.attendees.delete(socket.userId);
            userSockets.delete(socket.userId);

            // Leave the Socket.io room
            socket.leave(socket.roomId);

            console.log(`${user.name} left room: ${room.code}`);

            // If host leaves, end the session for everyone
            if (isHost) {
                console.log(`Host left room: ${room.code} - ending session`);

                // Notify all users that session ended
                io.to(socket.roomId).emit('session-ended', {
                    reason: 'host-left',
                    message: 'The host has left the room. Session ended.'
                });

                // Clean up room
                rooms.delete(socket.roomId);
                roomCodes.delete(room.code);

                // Remove all users from userSockets tracking
                for (const [userId, _] of room.attendees) {
                    userSockets.delete(userId);
                }
            } else {
                // If room is empty after regular user leaves, delete it
                if (room.attendees.size === 0) {
                    rooms.delete(socket.roomId);
                    roomCodes.delete(room.code);
                    console.log(`Room deleted: ${room.code}`);
                } else {
                    // Notify remaining users using Socket.io room broadcasting
                    io.to(socket.roomId).emit('user-left', {
                        userId: socket.userId,
                        userName: user.name,
                        attendees: Array.from(room.attendees.values())
                    });
                }
            }

            // Clear socket room info
            socket.roomId = null;
            socket.userId = null;

            socket.emit('room-left');

        } catch (error) {
            console.error('Error leaving room:', error);
        }
    });

      // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Handle leaving room on disconnect
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        const user = room.attendees.get(socket.userId);
        if (user) {
          const isHost = room.hostId === socket.userId;
          
          // Remove user from room
          room.attendees.delete(socket.userId);
          userSockets.delete(socket.userId);
          
          console.log(`=== DISCONNECT DEBUG ===`);
          console.log(`User disconnected: ${user.name} (${socket.userId})`);
          console.log(`Was host: ${isHost}`);
          console.log(`Room: ${room.code}`);
          console.log(`Remaining attendees: ${room.attendees.size}`);
          console.log(`========================`);
          
          // If host disconnects, end the session for everyone
          if (isHost) {
            console.log(`Host disconnected from room: ${room.code} - ending session`);
            
            // Notify all users that session ended
            io.to(socket.roomId).emit('session-ended', {
              reason: 'host-disconnected',
              message: 'The host has disconnected. Session ended.'
            });

            // Clean up room
            rooms.delete(socket.roomId);
            roomCodes.delete(room.code);
            
            // Remove all users from userSockets tracking
            for (const [userId, _] of room.attendees) {
              userSockets.delete(userId);
            }
          } else {
            // If room is empty after regular user disconnects, delete it
            if (room.attendees.size === 0) {
              rooms.delete(socket.roomId);
              roomCodes.delete(room.code);
              console.log(`Room deleted on disconnect: ${room.code}`);
            } else {
              // Notify remaining users using Socket.io room broadcasting
              io.to(socket.roomId).emit('user-left', {
                userId: socket.userId,
                userName: user.name,
                attendees: Array.from(room.attendees.values())
              });
            }
          }
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

// Debug port configuration
console.log('🔍 DEBUG: Environment PORT:', process.env.PORT);
console.log('🔍 DEBUG: Using PORT:', PORT);
console.log('🔍 DEBUG: All environment variables:', Object.keys(process.env));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Study Room WebSocket Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://0.0.0.0:${PORT}`);
    console.log(`🌐 HTTP endpoint: http://0.0.0.0:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 CORS origins configured for:`, [
        "http://localhost:5173", "http://localhost:5173/Pomododo", 
        "http://localhost:5174", "http://localhost:5174/Pomododo", 
        "http://localhost:5175", "http://localhost:5175/Pomododo", 
        "http://localhost:5176", "http://localhost:5176/Pomododo",
        "http://localhost:5177", "http://localhost:5177/Pomododo",
        "http://localhost:5178", "http://localhost:5178/Pomododo",
        "https://nikitap.github.io", "https://nikitap.github.io/Pomododo",
        "https://nikipra16.github.io", "https://nikipra16.github.io/Pomododo",
        "https://pomododo-production.up.railway.app"
    ]);
});
