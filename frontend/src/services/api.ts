import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const GATEWAY_URL =
  process.env.REACT_APP_GATEWAY_URL || "http://localhost:5158";
const CONSULTAS_URL =
  process.env.REACT_APP_CONSULTAS_URL || "http://localhost:4000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username: string, password: string) =>
    axios.post(`${GATEWAY_URL}/api/auth/login`, { username, password }),

  validate: (token: string) =>
    axios.get(`${GATEWAY_URL}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  validateDirect: (username: string, password: string) =>
    axios.post(`${API_BASE_URL}/usuarios/validate`, { username, password }),
};

export const adminAPI = {
  // Centros
  getCentros: () => api.get("/centros"),
  getCentro: (id: number) => api.get(`/centros/${id}`),
  createCentro: (data: any) => api.post("/centros", data),
  updateCentro: (id: number, data: any) => api.put(`/centros/${id}`, data),
  deleteCentro: (id: number) => api.delete(`/centros/${id}`),

  // Usuarios
  getUsuarios: () => api.get("/usuarios"),
  getUsuario: (id: number) => api.get(`/usuarios/${id}`),
  createUsuario: (data: any) => api.post("/usuarios", data),
  updateUsuario: (id: number, data: any) => api.put(`/usuarios/${id}`, data),
  deleteUsuario: (id: number) => api.delete(`/usuarios/${id}`),

  // Empleados
  getEmpleados: () => api.get("/empleados"),
  getEmpleado: (id: number) => api.get(`/empleados/${id}`),
  createEmpleado: (data: any) => api.post("/empleados", data),
  updateEmpleado: (id: number, data: any) => api.put(`/empleados/${id}`, data),
  deleteEmpleado: (id: number) => api.delete(`/empleados/${id}`),

  // Médicos
  getMedicos: () => api.get("/medicos"),
  getMedico: (id: number) => api.get(`/medicos/${id}`),
  createMedico: (data: any) => api.post("/medicos", data),
  updateMedico: (id: number, data: any) => api.put(`/medicos/${id}`, data),
  deleteMedico: (id: number) => api.delete(`/medicos/${id}`),

  // Especialidades
  getEspecialidades: () => api.get("/especialidades"),
  getEspecialidad: (id: number) => api.get(`/especialidades/${id}`),
  createEspecialidad: (data: any) => api.post("/especialidades", data),
  updateEspecialidad: (id: number, data: any) =>
    api.put(`/especialidades/${id}`, data),
  deleteEspecialidad: (id: number) => api.delete(`/especialidades/${id}`),
};

export const consultasAPI = {
  getConsultas: () =>
    axios.get(`${CONSULTAS_URL}/consultas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),

  getConsulta: (id: number) =>
    axios.get(`${CONSULTAS_URL}/consultas/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),

  createConsulta: (data: any) =>
    axios.post(`${CONSULTAS_URL}/consultas`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),

  updateConsulta: (id: number, data: any) =>
    axios.put(`${CONSULTAS_URL}/consultas/${id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),

  deleteConsulta: (id: number) =>
    axios.delete(`${CONSULTAS_URL}/consultas/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),

  getReportByDoctor: (doctorId: number, from?: string, to?: string) => {
    let url = `${CONSULTAS_URL}/reportes/doctor/${doctorId}`;
    if (from || to) {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      url += `?${params.toString()}`;
    }
    return axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
};

export const setupAPI = {
  createInitialAdmin: (data: any) =>
    axios.post(`${API_BASE_URL}/setup/admin`, data),
};

export default api;

