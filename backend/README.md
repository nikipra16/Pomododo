# Study Room WebSocket Server

A real-time WebSocket server for collaborative study rooms built with Node.js, Express, and Socket.io.

## Features

- ✅ **Room Management**: Create, join, and leave study rooms
- ✅ **Real-time Updates**: Live attendee list updates
- ✅ **Room Codes**: 6-character shareable room codes
- ✅ **Capacity Control**: Configurable room capacity (2-10 people)
- ✅ **Host System**: Room creator becomes the host
- ✅ **Auto-cleanup**: Empty rooms are automatically deleted

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The server will start on `http://localhost:3001`

### Testing

Open `test.html` in your browser to test the WebSocket functionality:
```bash
open test.html
```

## API Endpoints

### HTTP Endpoints
- `GET /` - Server status
- `GET /health` - Health check with room statistics

### WebSocket Events

#### Client → Server
- `create-room` - Create a new study room
- `join-room` - Join an existing room
- `leave-room` - Leave current room

#### Server → Client
- `room-created` - Room successfully created
- `room-joined` - Successfully joined a room
- `user-joined` - Another user joined the room
- `user-left` - A user left the room
- `room-left` - Successfully left the room
- `error` - Error message

## Room Data Structure

```javascript
{
  id: "room_1234567890_abc123",
  code: "ABC123",
  hostId: "user_123",
  hostName: "John Doe",
  attendees: Map([
    ["user_123", { name: "John Doe", joinedAt: Date, isHost: true }],
    ["user_456", { name: "Jane Smith", joinedAt: Date, isHost: false }]
  ]),
  maxCapacity: 5,
  createdAt: Date,
  status: "active"
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
├── test.html         # WebSocket test page
└── README.md         # This file
```

## Next Steps

- [ ] Add JWT authentication
- [ ] Implement code sharing functionality
- [ ] Add database persistence (Redis/MongoDB)
- [ ] Add room moderation features
- [ ] Implement rate limiting
- [ ] Add comprehensive error handling
- [ ] Write unit tests

## Deployment

The server is ready for deployment on platforms like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

Make sure to set the appropriate environment variables in your deployment platform.
