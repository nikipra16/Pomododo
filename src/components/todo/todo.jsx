import {useState,useEffect } from "react";
import * as React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Button,
    TextField, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '/src/components/AppContext.jsx';


function ToDo() {
    const { hasStarted } = useAppContext();
    // switched from array to object, so we can have key value pair. Better for time complexity?
    const [tasks, setTasks] = useState({});
    const [text, setText] = useState('');

    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
        setTasks(savedTasks);
    }, []);

    useEffect(() => {
        if (hasStarted === false) {
            setTasks([]);
            localStorage.removeItem('tasks');
        }
    }, [hasStarted]);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);


    const addTask = (text) => {
        if (text.trim() === '') return;
        const id = Date.now();
        setTasks(prev => ({
            ...prev,
            [id]: { id, task: text, completed: false }
        }));
        setText('');
    };

    const handleTask = (id) => {
        setTasks(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                completed: !prev[id].completed
            }
        }));
    };

    const deleteTask = (id) => {
        setTasks(prev => {
            const newTasks = { ...prev };
            delete newTasks[id];
            return newTasks;
        });
    };

    const taskList = Object.values(tasks);
    const hasTasks = taskList.length > 0;

    return (
        <div>
            <Typography 
                sx={{ 
                    fontSize: { xs: '20px', sm: '22px', md: '24px' }, 
                    mb: 2, 
                    fontWeight: 700,
                    color: '#2e7d32',
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '0.5px'
                }}
            >
                To Do List
            </Typography>
            <TextField
                label="New Task"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        addTask(text);
                    }
                }}
                fullWidth
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                        '& fieldset': {
                            borderColor: '#3f9e34',
                        },
                        '&:hover fieldset': {
                            borderColor: '#1f7a24',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#4caf50',
                            borderWidth: '2px',
                        },
                        '&:focus-within fieldset': {
                            borderColor: '#4caf50',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#3f9e34',
                    },
                    '& .MuiInputBase-input': {
                        color: '#333',
                    },
                }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => addTask(text)}
                sx={{
                    mb: 2,
                    backgroundColor: '#2e7d32',
                    '&:hover': {
                        backgroundColor: '#1b5e20',
                    },
                    textTransform: 'none',
                    fontWeight: 500,
                }}
            >
                Add Task
            </Button>

            {!hasTasks ? (
                <Typography 
                    sx={{ 
                        textAlign: 'center', 
                        color: '#3f9e34', 
                        fontStyle: 'italic',
                        mt: 3,
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    No tasks yet. Add one above!
                </Typography>
            ) : (
                <List sx={{ mt: 1 }}>
                    {taskList.map((task) => {
                    const labelId = `checkbox-list-label-${task.id}`;
                    return (
                            <ListItem 
                                key={task.id} 
                                secondaryAction={
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => deleteTask(task.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                deleteTask(task.id);
                                            }
                                        }}
                                        aria-label={`Delete task: ${task.task}`}
                                        sx={{
                                            color: '#d32f2f',
                                            minWidth: '44px',
                                            minHeight: '44px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                            },
                                            '&:focus-visible': {
                                                outline: '3px solid #d32f2f',
                                                outlineOffset: '2px',
                                            },
                                        }}
                                    >
                                <DeleteIcon />
                            </IconButton>
                                }
                                sx={{
                                    mb: 0.5,
                                    backgroundColor: task.completed ? '#f5f5f5' : '#fff',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        backgroundColor: task.completed ? '#eeeeee' : '#f9f9f9',
                                    },
                                }}
                            >
                                <ListItemButton 
                                    role={undefined} 
                                    onClick={() => handleTask(task.id)} 
                                    dense
                                    sx={{
                                        borderRadius: '8px',
                                    }}
                                >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={task.completed}
                                        tabIndex={-1}
                                        disableRipple
                                            sx={{
                                                color: '#3f9e34',
                                                '&.Mui-checked': {
                                                    color: '#3f9e34',
                                                },
                                            }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={task.task}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                                color: task.completed ? '#999' : '#333',
                                                fontSize: '15px',
                                            },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            )}
        </div>
    );
}

export default ToDo;