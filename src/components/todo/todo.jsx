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
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
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
        const newTasks = [...tasks, { id: tasks.length, task: text, completed: false }];
        setTasks(newTasks);
        setText('');
    };

    const handleTask = (id) => {
        setTasks(tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    };

    return (
        <div>
            <Typography sx={{ fontSize: '20px', mb: 0, fontFamily: 'Papyrus' }}>
                Do Do list
            </Typography>
            <TextField
                label="New Task"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#3f9e34',
                        },
                        '&:hover fieldset': {
                            borderColor: '#1f7a24',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#4caf50',
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
                style={{ marginTop: '10px', backgroundColor: '#3f9e34' }}
            >
                Add Task
            </Button>

            <List>
                {tasks.map((task) => {
                    const labelId = `checkbox-list-label-${task.id}`;
                    return (
                        <ListItem key={task.id} secondaryAction={
                            <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemButton role={undefined} onClick={() => handleTask(task.id)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={task.completed}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={task.task}
                                    style={{
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#999' : '#000'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

export default ToDo;