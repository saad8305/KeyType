import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [settings, setSettings] = useState({
    sound_enabled: true,
    vibration_enabled: true,
    default_difficulty: 'medium',
    default_duration: 60
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const response = await userService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      notifications.show({
        title: 'Error',
        message: 'New passwords do not match',
        color: 'red',
      });
      return;
    }
    
    if (passwordData.new_password.length < 3) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 3 characters',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      await userService.changePassword(passwordData.old_password, passwordData.new_password);
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully',
        color: 'green',
      });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to change password',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await userService.saveSettings(settings);
      localStorage.setItem('user_settings', JSON.stringify(settings));
      notifications.show({
        title: 'Success',
        message: 'Settings saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save settings',
        color: 'red',
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      notifications.show({
        title: 'Error',
        message: 'Type "DELETE" to confirm account deletion',
        color: 'red',
      });
      return;
    }
    
    if (window.confirm('Are you absolutely sure? This action cannot be undone!')) {
      try {
        await userService.deleteAccount();
        notifications.show({
          title: 'Account Deleted',
          message: 'Your account has been deleted',
          color: 'blue',
        });
        logout();
        navigate('/register');
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete account',
          color: 'red',
        });
      }
    }
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{
        fontSize: '2rem',
        textAlign: 'center',
        color: '#e2b714',
        marginBottom: '2rem'
      }}>
        ⚙️ Settings
      </h1>
      
      <div style={{
        background: 'rgba(20,20,30,0.4)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#e2b714' }}>
          🎮 Game Preferences
        </h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={(e) => setSettings({ ...settings, sound_enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>🔊 Sound Effects</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <input
              type="checkbox"
              checked={settings.vibration_enabled}
              onChange={(e) => setSettings({ ...settings, vibration_enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>📱 Vibration (on mobile)</span>
          </label>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
              Default Difficulty
            </label>
            <select
              value={settings.default_difficulty}
              onChange={(e) => setSettings({ ...settings, default_difficulty: e.target.value })}
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
              Default Duration (seconds)
            </label>
            <select
              value={settings.default_duration}
              onChange={(e) => setSettings({ ...settings, default_duration: parseInt(e.target.value) })}
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSaveSettings}
          style={{
            background: '#e2b714',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            color: '#1a1a2e',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1.5rem',
            width: '100%'
          }}
        >
          💾Save Settings
        </button>
      </div>
      
      <div style={{
        background: 'rgba(20,20,30,0.4)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#e2b714' }}>
          🔒Change Password
        </h2>
        
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              required
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#6366f1',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '40px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Updating...' : '🔑 Change Password'}
          </button>
        </form>
      </div>
      
      <div style={{
        background: 'rgba(239,68,68,0.1)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(239,68,68,0.3)'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ef4444' }}>
          ⚠️Danger Zone
        </h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>
            Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm account deletion
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE here"
            style={{
              width: '100%',
              background: '#1a1a2e',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'white'
            }}
          />
        </div>
        
        <button
          onClick={handleDeleteAccount}
          style={{
            background: '#ef4444',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🗑️ Delete Account
        </button>
      </div>
    </div>
  );
}