import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaCheck, FaUndo } from 'react-icons/fa';
import Auth from './Auth';
import './index.css';

const API_URL = 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Tabs "tasks" or "deleted"
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const [token, setToken] = useState(localStorage.getItem('token'));

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
    setTodos([]);
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
          handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await axios.post(API_URL, { 
        title: newTaskTitle, 
        description: newTaskDescription 
      });
      setTodos([res.data, ...todos]);
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsModalOpen(false);
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

  const softDeleteTodo = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { isDeleted: true });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Error soft deleting todo:', err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { isDeleted: false });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Error restoring todo:', err);
    }
  };

  const permanentlyDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  // Filter based on Tab selection AND search query
  const displayedTodos = todos
    .filter(t => activeTab === 'tasks' ? !t.isDeleted : t.isDeleted)
    .filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h1>Dashboard</h1>
        <ul className="nav-menu">
          <li className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
            My Tasks
          </li>
          <li className={activeTab === 'deleted' ? 'active' : ''} onClick={() => setActiveTab('deleted')}>
            Deleted
          </li>
        </ul>
        <div style={{ marginTop: 'auto' }}>
          <button className="logout-btn" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search your task here..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="task-area">
          {loading ? (
            <div className="empty-wrapper">
              <p className="empty-state">Loading tasks...</p>
            </div>
          ) : displayedTodos.length === 0 ? (
            <div className="empty-wrapper">
              <p className="empty-state">No tasks here</p>
            </div>
          ) : (
            <ul className="todo-list">
              {displayedTodos.map(todo => (
                <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-content" onClick={() => toggleComplete(todo._id, todo.completed)}>
                    
                    {/* Checkbox only shown in My Tasks */}
                    {activeTab === 'tasks' && (
                       <div className="checkbox">
                         {todo.completed && <FaCheck size={12} />}
                       </div>
                    )}
                    
                    <div className="todo-text-group" style={{ marginLeft: activeTab === 'tasks' ? '12px' : '0' }}>
                      <span className="todo-title">{todo.title || todo.text}</span>
                      {todo.description && <span className="todo-description">{todo.description}</span>}
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    {activeTab === 'tasks' ? (
                      <button className="action-btn btn-delete" onClick={() => softDeleteTodo(todo._id)} title="Send to Deleted">
                        <FaTrash size={14} />
                      </button>
                    ) : (
                      <>
                        <button className="action-btn btn-restore" onClick={() => restoreTodo(todo._id)} title="Restore Task">
                           <FaUndo size={14} />
                        </button>
                        <button className="action-btn btn-delete" onClick={() => permanentlyDeleteTodo(todo._id)} title="Permanently Delete">
                           <FaTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Floating Action Button (Only show on My Tasks tab) */}
        {activeTab === 'tasks' && (
          <button className="fab" onClick={() => setIsModalOpen(true)}>
            +
          </button>
        )}
      </div>

      {/* New Task Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Task</h2>
            <form onSubmit={addTodo}>
              <input 
                type="text" 
                className="modal-input" 
                placeholder="Task title" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                required
              />
              <textarea 
                className="modal-textarea" 
                placeholder="Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
