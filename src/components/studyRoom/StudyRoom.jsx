import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase.js';
import io from 'socket.io-client';
import './studyRoom.css';

// Dynamic WebSocket URL for development and production
const WEBSOCKET_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'  // Development
    : window.location.origin;  // Production - same domain as frontend!

export default function StudyRoom() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }

        if (!roomCode) {
            navigate('/profile');
            return;
        }

        // Connect to WebSocket server
        const newSocket = io(WEBSOCKET_URL);
        setSocket(newSocket);

        // Join the room
        newSocket.on('connect', () => {
            console.log('Connected to study room server');
            
            const userData = {
                roomCode: roomCode.toUpperCase(),
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || auth.currentUser.email
            };

            newSocket.emit('join-room', userData);
        });

        newSocket.on('room-joined', (data) => {
            console.log('Joined room:', data);
            setRoomData(data.room);
            setLoading(false);
        });

        newSocket.on('user-joined', (data) => {
            console.log('User joined:', data);
            setRoomData(prev => ({
                ...prev,
                attendees: data.attendees
            }));
        });

        newSocket.on('user-left', (data) => {
            console.log('User left:', data);
            setRoomData(prev => ({
                ...prev,
                attendees: data.attendees
            }));
        });

        newSocket.on('session-ended', (data) => {
            console.log('Session ended:', data);
            alert(data.message);
            navigate('/profile');
        });

        newSocket.on('error', (data) => {
            console.error('Error:', data.message);
            setError(data.message);
            setLoading(false);
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [roomCode, navigate]);

    const handleLeaveRoom = () => {
        if (socket) {
            socket.emit('leave-room');
            navigate('/profile');
        }
    };

    if (loading) {
        return (
            <div className="study-room-container">
                <div className="loading">Loading room...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="study-room-container">
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/profile')}>Back to Profile</button>
                </div>
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="study-room-container">
                <div className="error-message">
                    <h3>Room not found</h3>
                    <button onClick={() => navigate('/profile')}>Back to Profile</button>
                </div>
            </div>
        );
    }

    return (
        <div className="study-room-container">
            <div className="study-room-header">
                <h2>Study Room: {roomData.code}</h2>
                <button onClick={handleLeaveRoom} className="leave-room-btn">
                    Leave Room
                </button>
            </div>

            <div className="room-info">
                <div className="room-details">
                    <p><strong>Host:</strong> {roomData.hostName}</p>
                    <p><strong>Capacity:</strong> {roomData.attendees.length} / {roomData.maxCapacity}</p>
                    <p><strong>Room Code:</strong> <span className="room-code">{roomData.code}</span></p>
                </div>

                <div className="attendees-list">
                    <h3>Attendees ({roomData.attendees.length})</h3>
                    <div className="attendees">
                        {roomData.attendees.map((attendee, index) => (
                            <div key={index} className={`attendee ${attendee.isHost ? 'host' : ''}`}>
                                <span className="attendee-name">{attendee.name}</span>
                                {attendee.isHost && <span className="host-badge">Host</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="room-content">
                <div className="study-tools">
                    <h3>Study Tools</h3>
                    <p>Study room features coming soon...</p>
                </div>
            </div>
        </div>
    );
}
