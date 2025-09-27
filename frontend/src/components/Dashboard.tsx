import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, consultasAPI } from '../services/api';
import './Dashboard.css';

interface Centro {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

interface Usuario {
  id: number;
  username: string;
  role: string;
  centroId?: number;
}

interface Consulta {
  id: number;
  paciente: string;
  doctorId: number;
  centroId: number;
  fecha: string;
  notas?: string;
  estado: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin, isMedico } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [centros, setCentros] = useState<Centro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);

  // Form states
  const [newCentro, setNewCentro] = useState({
    nombre: '', direccion: '', ciudad: '', telefono: ''
  });
  const [newUsuario, setNewUsuario] = useState({
    username: '', password: '', role: 'empleado', centroId: ''
  });
  const [newConsulta, setNewConsulta] = useState({
    paciente: '', doctorId: '', centroId: '', fecha: '', notas: '', estado: 'programada'
  });

  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'centros' && isAdmin) {
        const response = await adminAPI.getCentros();
        setCentros(response.data);
      } else if (activeTab === 'usuarios' && isAdmin) {
        const response = await adminAPI.getUsuarios();
        setUsuarios(response.data);
      } else if (activeTab === 'consultas') {
        const response = await consultasAPI.getConsultas();
        setConsultas(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await adminAPI.createCentro(newCentro);
      setNewCentro({ nombre: '', direccion: '', ciudad: '', telefono: '' });
      loadInitialData();
      alert('Centro creado exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creando centro');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = {
        ...newUsuario,
        centroId: newUsuario.centroId ? parseInt(newUsuario.centroId) : null
      };
      await adminAPI.createUsuario(userData);
      setNewUsuario({ username: '', password: '', role: 'empleado', centroId: '' });
      loadInitialData();
      alert('Usuario creado exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const consultaData = {
        ...newConsulta,
        doctorId: parseInt(newConsulta.doctorId),
        centroId: parseInt(newConsulta.centroId)
      };
      await consultasAPI.createConsulta(consultaData);
      setNewConsulta({ paciente: '', doctorId: '', centroId: '', fecha: '', notas: '', estado: 'programada' });
      loadInitialData();
      alert('Consulta creada exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creando consulta');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="overview">
      <h3>👋 Bienvenido, {user?.username}!</h3>
      <div className="user-info">
        <p><strong>Rol:</strong> {user?.role}</p>
        <p><strong>Centro ID:</strong> {user?.centroId || 'No asignado'}</p>
      </div>
      
      <div className="system-status">
        <h4>🔧 Estado del Sistema</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Admin API:</span>
            <span className="status-indicator online">🟢 Online</span>
          </div>
          <div className="status-item">
            <span className="status-label">Consultas API:</span>
            <span className="status-indicator online">🟢 Online</span>
          </div>
          <div className="status-item">
            <span className="status-label">Gateway API:</span>
            <span className="status-indicator offline">🔴 Offline</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h4>⚡ Acciones Rápidas</h4>
        <div className="action-buttons">
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('centros')} className="action-btn">
                🏥 Gestionar Centros
              </button>
              <button onClick={() => setActiveTab('usuarios')} className="action-btn">
                👥 Gestionar Usuarios
              </button>
            </>
          )}
          <button onClick={() => setActiveTab('consultas')} className="action-btn">
            📋 Ver Consultas
          </button>
        </div>
      </div>
    </div>
  );

  const renderCentros = () => (
    <div className="centros-section">
      <h3>🏥 Gestión de Centros</h3>
      
      <form onSubmit={handleCreateCentro} className="create-form">
        <h4>➕ Crear Nuevo Centro</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nombre del centro"
            value={newCentro.nombre}
            onChange={(e) => setNewCentro({...newCentro, nombre: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Dirección"
            value={newCentro.direccion}
            onChange={(e) => setNewCentro({...newCentro, direccion: e.target.value})}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Ciudad"
            value={newCentro.ciudad}
            onChange={(e) => setNewCentro({...newCentro, ciudad: e.target.value})}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={newCentro.telefono}
            onChange={(e) => setNewCentro({...newCentro, telefono: e.target.value})}
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creando...' : 'Crear Centro'}
        </button>
      </form>

      <div className="data-list">
        <h4>📋 Centros Existentes</h4>
        {centros.length === 0 ? (
          <p>No hay centros registrados</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Ciudad</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {centros.map(centro => (
                  <tr key={centro.id}>
                    <td>{centro.id}</td>
                    <td>{centro.nombre}</td>
                    <td>{centro.direccion}</td>
                    <td>{centro.ciudad}</td>
                    <td>{centro.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsuarios = () => (
    <div className="usuarios-section">
      <h3>👥 Gestión de Usuarios</h3>
      
      <form onSubmit={handleCreateUsuario} className="create-form">
        <h4>➕ Crear Nuevo Usuario</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="Username"
            value={newUsuario.username}
            onChange={(e) => setNewUsuario({...newUsuario, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUsuario.password}
            onChange={(e) => setNewUsuario({...newUsuario, password: e.target.value})}
            required
          />
        </div>
        <div className="form-row">
          <select
            value={newUsuario.role}
            onChange={(e) => setNewUsuario({...newUsuario, role: e.target.value})}
          >
            <option value="empleado">Empleado</option>
            <option value="medico">Médico</option>
            <option value="admin">Administrador</option>
          </select>
          <input
            type="number"
            placeholder="Centro ID (opcional)"
            value={newUsuario.centroId}
            onChange={(e) => setNewUsuario({...newUsuario, centroId: e.target.value})}
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>

      <div className="data-list">
        <h4>📋 Usuarios Existentes</h4>
        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Rol</th>
                  <th>Centro ID</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.username}</td>
                    <td>
                      <span className={`role-badge ${usuario.role}`}>
                        {usuario.role}
                      </span>
                    </td>
                    <td>{usuario.centroId || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderConsultas = () => (
    <div className="consultas-section">
      <h3>📋 Gestión de Consultas</h3>
      
      <form onSubmit={handleCreateConsulta} className="create-form">
        <h4>➕ Crear Nueva Consulta</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nombre del paciente"
            value={newConsulta.paciente}
            onChange={(e) => setNewConsulta({...newConsulta, paciente: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="ID del doctor"
            value={newConsulta.doctorId}
            onChange={(e) => setNewConsulta({...newConsulta, doctorId: e.target.value})}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            placeholder="ID del centro"
            value={newConsulta.centroId}
            onChange={(e) => setNewConsulta({...newConsulta, centroId: e.target.value})}
            required
          />
          <input
            type="datetime-local"
            value={newConsulta.fecha}
            onChange={(e) => setNewConsulta({...newConsulta, fecha: e.target.value})}
            required
          />
        </div>
        <div className="form-row">
          <textarea
            placeholder="Notas (opcional)"
            value={newConsulta.notas}
            onChange={(e) => setNewConsulta({...newConsulta, notas: e.target.value})}
          />
          <select
            value={newConsulta.estado}
            onChange={(e) => setNewConsulta({...newConsulta, estado: e.target.value})}
          >
            <option value="programada">Programada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creando...' : 'Crear Consulta'}
        </button>
      </form>

      <div className="data-list">
        <h4>📋 Consultas {isMedico ? '(Solo tu centro)' : ''}</h4>
        {consultas.length === 0 ? (
          <p>No hay consultas registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Doctor ID</th>
                  <th>Centro ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map(consulta => (
                  <tr key={consulta.id}>
                    <td>{consulta.id}</td>
                    <td>{consulta.paciente}</td>
                    <td>{consulta.doctorId}</td>
                    <td>{consulta.centroId}</td>
                    <td>{new Date(consulta.fecha).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${consulta.estado}`}>
                        {consulta.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏥 Hospital System Dashboard</h1>
        <div className="user-menu">
          <span>👤 {user?.username} ({user?.role})</span>
          <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Inicio
        </button>
        
        {isAdmin && (
          <>
            <button 
              className={activeTab === 'centros' ? 'active' : ''}
              onClick={() => setActiveTab('centros')}
            >
              🏥 Centros
            </button>
            <button 
              className={activeTab === 'usuarios' ? 'active' : ''}
              onClick={() => setActiveTab('usuarios')}
            >
              👥 Usuarios
            </button>
          </>
        )}
        
        <button 
          className={activeTab === 'consultas' ? 'active' : ''}
          onClick={() => setActiveTab('consultas')}
        >
          📋 Consultas
        </button>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}
        
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'centros' && isAdmin && renderCentros()}
        {activeTab === 'usuarios' && isAdmin && renderUsuarios()}
        {activeTab === 'consultas' && renderConsultas()}
      </main>
    </div>
  );
};

export default Dashboard;