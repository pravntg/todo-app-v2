const express = require('express');
const cors = require('cors');
require('dotenv').config();

const store = require('./store');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- NO MONGODB CONNECTION NEEDED ANYMORE ---
console.log('Backend starting using local Local Memory Storage (No Database needed!)...');

// Authentication Routes
app.use('/api/auth', require('./routes/auth'));

// --- PROTECTED TODO ROUTES ---

// Get all todos FOR THE LOGGED IN USER
app.get('/api/todos', auth, (req, res) => {
    try {
        // Filter todos from our local array
        const userTodos = store.todos
            .filter(t => t.user === req.user.id)
            .sort((a, b) => b.createdAt - a.createdAt);
        res.json(userTodos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new todo FOR THE LOGGED IN USER
app.post('/api/todos', auth, (req, res) => {
    try {
        const newTodo = {
            _id: Date.now().toString(), // generate fake mongo-like ID
            user: req.user.id,
            text: req.body.text,
            completed: false,
            createdAt: new Date().getTime()
        };
        
        store.todos.push(newTodo);
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a todo 
app.put('/api/todos/:id', auth, (req, res) => {
    try {
        const todoIndex = store.todos.findIndex(t => t._id === req.params.id && t.user === req.user.id);
        
        if (todoIndex === -1) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        
        // Update it
        if (req.body.completed !== undefined) store.todos[todoIndex].completed = req.body.completed;
        if (req.body.text !== undefined) store.todos[todoIndex].text = req.body.text;
        
        res.json(store.todos[todoIndex]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a todo
app.delete('/api/todos/:id', auth, (req, res) => {
    try {
        const todoIndex = store.todos.findIndex(t => t._id === req.params.id && t.user === req.user.id);
        
        if (todoIndex === -1) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        
        // Remove from array
        store.todos.splice(todoIndex, 1);
        res.json({ message: 'Todo removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`✓ Server successfully running on port ${PORT}`));
