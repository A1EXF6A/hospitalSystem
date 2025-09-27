import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:5158';
const CONSULTAS_URL = process.env.REACT_APP_CONSULTAS_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    axios.post(`${GATEWAY_URL}/api/auth/login`, { username, password }),
  
  validate: (token: string) =>
    axios.get(`${GATEWAY_URL}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    
  validateDirect: (username: string, password: string) =>
    axios.post(`${API_BASE_URL}/usuarios/validate`, { username, password }),
};

export const adminAPI = {
  // Centros
  getCentros: () => api.get('/centros'),
  createCentro: (data: any) => api.post('/centros', data),
  
  // Usuarios
  getUsuarios: () => api.get('/usuarios'),
  createUsuario: (data: any) => api.post('/usuarios', data),
  
  // Empleados
  getEmpleados: () => api.get('/empleados'),
  createEmpleado: (data: any) => api.post('/empleados', data),
  
  // Médicos
  getMedicos: () => api.get('/medicos'),
  createMedico: (data: any) => api.post('/medicos', data),
  
  // Especialidades
  getEspecialidades: () => api.get('/especialidades'),
  createEspecialidad: (data: any) => api.post('/especialidades', data),
};

export const consultasAPI = {
  getConsultas: () => 
    axios.get(`${CONSULTAS_URL}/consultas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    
  createConsulta: (data: any) =>
    axios.post(`${CONSULTAS_URL}/consultas`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    
  getReportByDoctor: (doctorId: number) =>
    axios.get(`${CONSULTAS_URL}/reportes/doctor/${doctorId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
};

export const setupAPI = {
  createInitialAdmin: (data: any) =>
    axios.post(`${API_BASE_URL}/setup/admin`, data),
};

export default api;