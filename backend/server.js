const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Force Node to use Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const auth = require('./middleware/auth');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✓ MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Authentication Routes
app.use('/api/auth', require('./routes/auth'));

// --- PROTECTED TODO ROUTES ---

// Get all todos FOR THE LOGGED IN USER
app.get('/api/todos', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new todo FOR THE LOGGED IN USER
app.post('/api/todos', auth, async (req, res) => {
    try {
        const newTodo = new Todo({
            user: req.user.id,
            title: req.body.title || 'Untitled',
            description: req.body.description || ''
        });
        
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a todo 
app.put('/api/todos/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        
        if (req.body.completed !== undefined) todo.completed = req.body.completed;
        if (req.body.title !== undefined) todo.title = req.body.title;
        if (req.body.description !== undefined) todo.description = req.body.description;
        if (req.body.isDeleted !== undefined) todo.isDeleted = req.body.isDeleted;
        
        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Permanently Delete a todo
app.delete('/api/todos/:id', auth, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found or not authorized' });
        }
        
        res.json({ message: 'Todo permanently removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`✓ Server successfully running on port ${PORT}`));
