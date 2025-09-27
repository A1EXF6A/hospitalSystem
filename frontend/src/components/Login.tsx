import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setupAPI } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    username: 'admin',
    password: 'admin123',
    centroId: 1
  });
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setupAPI.createInitialAdmin(setupData);
      setShowSetup(false);
      setUsername(setupData.username);
      setPassword(setupData.password);
      setError('');
      alert('Usuario administrador creado exitosamente. Puedes hacer login ahora.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creando usuario administrador');
    } finally {
      setLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>🏥 Setup Inicial - Hospital System</h2>
          <p>Crear el primer usuario administrador</p>
          
          <form onSubmit={handleSetup}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={setupData.username}
                onChange={(e) => setSetupData({...setupData, username: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={setupData.password}
                onChange={(e) => setSetupData({...setupData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Centro ID (opcional):</label>
              <input
                type="number"
                value={setupData.centroId}
                onChange={(e) => setSetupData({...setupData, centroId: parseInt(e.target.value) || 1})}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Creando...' : 'Crear Admin'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setShowSetup(false)}
              className="link-button"
            >
              Volver al Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🏥 Hospital System</h2>
        <p>Sistema de Gestión Hospitalaria</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu username"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <button 
            onClick={() => setShowSetup(true)}
            className="link-button"
          >
            ¿Primera vez? Crear usuario administrador
          </button>
          
          <div className="demo-credentials">
            <small>
              <strong>Credenciales de prueba:</strong><br />
              Username: admin<br />
              Password: admin123
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;