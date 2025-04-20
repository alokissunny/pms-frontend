import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Task {
  id: number;
  title: string;
  description: string;
}

export const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    if (!title.trim()) return;

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, title, description }
          : task
      ));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now(),
        title,
        description,
      };
      setTasks([...tasks, newTask]);
    }

    // Reset form
    setTitle('');
    setDescription('');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Task Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTask}
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
            {editingTask && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingTask(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Tasks
          </Typography>
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={task.description}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleEditTask(task)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          {tasks.length === 0 && (
            <Typography color="textSecondary" align="center">
              No tasks yet. Add your first task above!
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}; 