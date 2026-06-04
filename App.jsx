import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import useAuthStore from './store/authStore';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import Race from './pages/Race';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}
function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { darkMode, setDarkMode } = useTheme();
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0e0e0f',
    }}>
      <BrowserRouter>
        <div style={{
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #1a1a1c',
          background: '#0e0e0f',
        }}>
          <Link to="/race" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>🏁 Race</Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#e2b714',
              letterSpacing: '-0.5px'
            }}>
              ⌨️ TypeMaster
            </div>
          </Link>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>Play</Link>
              <Link to="/leaderboard" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>Leaderboard</Link>
              <Link to="/profile" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>Profile</Link>
              <Link to="/settings" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>Settings</Link>
              <span style={{ color: '#e2b714', fontSize: '0.85rem' }}>👤 {user?.username}</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  background: '#1a1a1c',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  color: '#e2b714',
                  fontSize: '0.75rem'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  color: '#ca4754',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#888' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', color: '#e2b714' }}>Register</Link>
            </div>
          )}
        </div>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route 
            path="/leaderboard" 
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route path="/race" element={
  <PrivateRoute>
    <Race />
  </PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
function App() {
  return (
    <ThemeProvider>
      <Notifications position="top-right" />
      <AppContent />
    </ThemeProvider>
  );
}
export default App;