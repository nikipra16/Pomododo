import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase.js';
import io from 'socket.io-client';
import './studyRoom.css';

// Dynamic WebSocket URL for development and production
const WEBSOCKET_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'  // Development
    : 'https://pomododo-production.up.railway.app';  // Production Railway backend

export default function CreateRoom() {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [maxCapacity, setMaxCapacity] = useState(5);
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [roomCreated, setRoomCreated] = useState(false);
    const [roomJoined, setRoomJoined] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [mode, setMode] = useState('create'); // 'create' or 'join'

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }
        const newSocket = io(WEBSOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to study room server');
        });

        newSocket.on('room-created', (data) => {
            console.log('Room created:', data);
            setRoomData(data);
            setRoomCreated(true);
            setLoading(false);
        });

        newSocket.on('room-joined', (data) => {
            console.log('Room joined:', data);
            setRoomData(data);
            setRoomJoined(true);
            setLoading(false);
        });

        newSocket.on('error', (data) => {
            console.error('Error:', data.message);
            setError(data.message);
            setLoading(false);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from study room server');
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [navigate]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        
        if (!socket || !auth.currentUser) return;

        setLoading(true);
        setError('');

        const userData = {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || auth.currentUser.email,
            maxCapacity: maxCapacity
        };

        console.log('Creating room with data:', userData);
        socket.emit('create-room', userData);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        
        if (!socket || !auth.currentUser) return;

        setLoading(true);
        setError('');

        const userData = {
            roomCode: roomCode.trim().toUpperCase(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || auth.currentUser.email
        };

        console.log('Joining room with data:', userData);
        socket.emit('join-room', userData);
    };

    const handleEnterRoom = () => {
        if (roomData) {
            navigate(`/room/${roomData.roomCode}`);
        }
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    if (!auth.currentUser) {
        return null;
    }

    return (
        <div className="create-room-container">
            <div className="create-room-card">
                <h2>Study Room</h2>
                
                {!roomCreated && !roomJoined ? (
                    <div>
                        {/* Mode Selection */}
                        <div className="mode-selection">
                            <button 
                                className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
                                onClick={() => setMode('create')}
                            >
                                Create Room
                            </button>
                            <button 
                                className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
                                onClick={() => setMode('join')}
                            >
                                Join Room
                            </button>
                        </div>

                        {/* Create Room Form */}
                        {mode === 'create' && (
                            <form onSubmit={handleCreateRoom} className="create-room-form">
                                <div className="form-group">
                                    <label htmlFor="roomName">Room Name (Optional)</label>
                                    <input
                                        type="text"
                                        id="roomName"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Enter room name"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="maxCapacity">Maximum Capacity</label>
                                    <select
                                        id="maxCapacity"
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
                                        className="form-select"
                                    >
                                        <option value={2}>2 people</option>
                                        <option value={3}>3 people</option>
                                        <option value={4}>4 people</option>
                                        <option value={5}>5 people</option>
                                        <option value={6}>6 people</option>
                                        <option value={7}>7 people</option>
                                        <option value={8}>8 people</option>
                                        <option value={9}>9 people</option>
                                        <option value={10}>10 people</option>
                                    </select>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="create-room-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Room...' : 'Create Room'}
                                </button>
                            </form>
                        )}

                        {/* Join Room Form */}
                        {mode === 'join' && (
                            <form onSubmit={handleJoinRoom} className="join-room-form">
                                <div className="form-group">
                                    <label htmlFor="roomCode">Room Code</label>
                                    <input
                                        type="text"
                                        id="roomCode"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                        placeholder="Enter room code (e.g., ABC123)"
                                        className="form-input"
                                        maxLength="6"
                                    />
                                </div>

                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="join-room-btn"
                                    disabled={loading || !roomCode.trim()}
                                >
                                    {loading ? 'Joining Room...' : 'Join Room'}
                                </button>
                            </form>
                        )}

                        <div className="back-to-profile">
                            <button onClick={handleBackToProfile} className="back-btn">
                                Back to Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="room-success">
                        <div className="success-icon">✅</div>
                        <h3>{roomCreated ? 'Room Created Successfully!' : 'Room Joined Successfully!'}</h3>
                        <div className="room-info">
                            <p><strong>Room Code:</strong> <span className="room-code">{roomData.roomCode}</span></p>
                            <p><strong>Capacity:</strong> {roomData.room.maxCapacity} people</p>
                            <p><strong>Host:</strong> {roomData.room.hostName}</p>
                            <p><strong>Attendees:</strong> {roomData.room.attendees.length} people</p>
                        </div>
                        
                        <div className="room-actions">
                            <button onClick={handleEnterRoom} className="enter-room-btn">
                                Enter Room
                            </button>
                            <button onClick={handleBackToProfile} className="back-btn">
                                Back to Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
