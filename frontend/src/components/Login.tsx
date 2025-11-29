import React, { useState } from "react";
import { useGoogleOneTapLogin, GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../contexts/AuthContext";
import { setupAPI } from "../services/api";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [setupData, setSetupData] = useState({
    username: "admin",
    password: "admin123",
    centroId: 1,
  });

  const { login } = useAuth();

  // Google OAuth handlers
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('Google Login Success:', credentialResponse);
    
    try {
      // Decode the JWT token to get user info
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('Decoded User Info:', userInfo);
      console.log('User Name:', userInfo.name);
      console.log('User Email:', userInfo.email);
      console.log('User Picture:', userInfo.picture);
      
      // Here you would normally send the token to your backend
      // For now, just show success
      alert(`¡Login exitoso con Google!\nUsuario: ${userInfo.name}\nEmail: ${userInfo.email}`);
      
    } catch (err) {
      console.error('Error decoding token:', err);
      setError("Error procesando el login con Google");
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Error');
    setError("Error al iniciar sesión con Google");
  };

  // Google One Tap configuration
  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    // Optional: disable one-tap if you want only the button
    disabled: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await setupAPI.createInitialAdmin(setupData);
      setShowSetup(false);
      setUsername(setupData.username);
      setPassword(setupData.password);
      setError("");
      alert(
        "Usuario administrador creado exitosamente. Puedes hacer login ahora.",
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error creando usuario administrador",
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Setup Inicial - Hospital System</h2>
          <p>Crear el primer usuario administrador</p>

          <form onSubmit={handleSetup}>
            <div className="form-group">
              <label>Usuario:</label>
              <input
                type="text"
                value={setupData.username}
                onChange={(e) =>
                  setSetupData({ ...setupData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña:</label>
              <div className="password-input-container">
                <input
                  type={showSetupPassword ? "text" : "password"}
                  value={setupData.password}
                  onChange={(e) =>
                    setSetupData({ ...setupData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                >
                  {showSetupPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Centro ID (opcional):</label>
              <input
                type="number"
                value={setupData.centroId}
                onChange={(e) =>
                  setSetupData({
                    ...setupData,
                    centroId: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Creando..." : "Crear Admin"}
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
        <h2>Hospital System</h2>
        <p>Sistema de Gestión Hospitalaria</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Google OAuth Options */}
        <div className="oauth-section">
          <div className="divider">
            <span>o continúa con</span>
          </div>
          
          {/* Google One Tap Button (Oficial) */}
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        </div>

        <div className="login-footer">
          <button onClick={() => setShowSetup(true)} className="link-button">
            ¿Primera vez? Crear usuario administrador
          </button>

          <div className="demo-credentials">
            <small>
              <strong>Credenciales de prueba:</strong>
              <br />
              Username: admin
              <br />
              Password: admin123
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;