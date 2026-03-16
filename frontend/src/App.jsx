import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaCheck, FaSignOutAlt } from 'react-icons/fa';
import Auth from './Auth';
import './index.css';

const API_URL = 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token'));

  // If token changes, set the global axios authorization header automatically!
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchTodos();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTodos([]); // Clear UI
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      if (err.response?.status === 401) {
          handleLogout(); // Token expired or invalid
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    try {
      const res = await axios.post(API_URL, { text: inputText });
      setTodos([res.data, ...todos]);
      setInputText('');
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  // IF NOT LOGGED IN -> SHOW AUTH SCREEN
  if (!token) {
    return <Auth setToken={setToken} />;
  }

  // IF LOGGED IN -> SHOW TODO APP
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: 0 }}>My Tasks.</h1>
        <button onClick={handleLogout} className="delete-btn" style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
      
      <form onSubmit={addTodo} className="input-container">
        <input 
          type="text" 
          className="todo-input" 
          placeholder="What needs to be done?" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="add-btn">Add Task</button>
      </form>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading your secure tasks...</p>
      ) : todos.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>You're all caught up! ✨</p>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content" onClick={() => toggleComplete(todo._id, todo.completed)}>
                <div className="checkbox">
                  {todo.completed && <FaCheck size={12} />}
                </div>
                <span className="todo-text">{todo.text}</span>
              </div>
              <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>
                <FaTrash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
