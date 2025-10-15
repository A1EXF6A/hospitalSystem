import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminAPI, consultasAPI } from "../services/api";
import jsPDF from "jspdf";
import "./Dashboard.css";

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

interface Empleado {
  id: number;
  nombre: string;
  cedula: string;
  centro: { id: number; nombre: string };
}

interface Medico {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  especialidad: { id: number; nombre: string };
  centro: { id: number; nombre: string };
}

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
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
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  // Validation states
  const [centroErrors, setCentroErrors] = useState<{ [key: string]: string }>(
    {},
  );
  const [usuarioErrors, setUsuarioErrors] = useState<{ [key: string]: string }>(
    {},
  );
  const [especialidadErrors, setEspecialidadErrors] = useState<{
    [key: string]: string;
  }>({});
  const [consultaErrors, setConsultaErrors] = useState<{
    [key: string]: string;
  }>({});

  // Data states
  const [centros, setCentros] = useState<Centro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);
  const [selectedDoctorForReport, setSelectedDoctorForReport] =
    useState<Medico | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<Medico | null>(null);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalCentros: 0,
    totalMedicos: 0,
    totalConsultas: 0,
    consultasHoy: 0,
    consultasPendientes: 0,
    consultasCompletadas: 0,
    recentConsultas: [] as Consulta[],
  });

  // Form states
  const [newCentro, setNewCentro] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });
  const [newUsuario, setNewUsuario] = useState({
    // Campos básicos para todos los tipos
    username: "",
    password: "",
    role: "empleado",
    centroId: "",

    // Campos específicos por tipo
    nombre: "",
    cedula: "",

    // Para empleados
    cargo: "",

    // Para médicos
    correo: "",
    telefono: "",
    especialidadId: "",
  });
  const [newEspecialidad, setNewEspecialidad] = useState({
    nombre: "",
    descripcion: "",
  });
  const [newConsulta, setNewConsulta] = useState({
    paciente: "",
    doctorId: "",
    centroId: "",
    fecha: "",
    notas: "",
    estado: "programada",
  });

  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  // Load current doctor info when user is a doctor
  useEffect(() => {
    if (isMedico && user?.id) {
      // For doctors, we'll create a mock doctor object based on user info
      // In a real system, this should come from a doctor-specific endpoint
      setCurrentDoctor({
        id: parseInt(user.id),
        nombre: user.username, // This should be the doctor's real name
        cedula: "N/A",
        correo: "N/A",
        telefono: "N/A",
        especialidad: { id: 1, nombre: "General" }, // Default speciality
        centro: {
          id: user.centroId || 1,
          nombre: `Centro ${user.centroId || 1}`,
        },
      });
    }
  }, [isMedico, user?.id, user?.centroId, user?.username]);

  // Validation functions
  const validateCentro = (
    centro: typeof newCentro,
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!centro.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    } else if (centro.nombre.length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (centro.nombre.length > 100) {
      errors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    if (!centro.direccion.trim()) {
      errors.direccion = "La dirección es requerida";
    } else if (centro.direccion.length < 10) {
      errors.direccion = "La dirección debe tener al menos 10 caracteres";
    }

    if (!centro.ciudad.trim()) {
      errors.ciudad = "La ciudad es requerida";
    } else if (centro.ciudad.length < 2) {
      errors.ciudad = "La ciudad debe tener al menos 2 caracteres";
    }

    if (!centro.telefono.trim()) {
      errors.telefono = "El teléfono es requerido";
    } else if (!/^\+?[\d\s\-\(\)]{7,15}$/.test(centro.telefono)) {
      errors.telefono = "Formato de teléfono inválido (7-15 dígitos)";
    }

    return errors;
  };

  const validateUsuario = (
    usuario: typeof newUsuario,
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!usuario.username.trim()) {
      errors.username = "El username es requerido";
    } else if (usuario.username.length < 3) {
      errors.username = "El username debe tener al menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(usuario.username)) {
      errors.username =
        "El username solo puede contener letras, números y guiones bajos";
    }

    if (!usuario.password.trim()) {
      errors.password = "La contraseña es requerida";
    } else if (usuario.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (
      (usuario.role === "medico" || usuario.role === "empleado") &&
      !usuario.centroId
    ) {
      errors.centroId = "El centro es requerido para médicos y empleados";
    }

    if (usuario.role === "medico" || usuario.role === "empleado") {
      if (!usuario.nombre.trim()) {
        errors.nombre = "El nombre es requerido";
      } else if (usuario.nombre.length < 2) {
        errors.nombre = "El nombre debe tener al menos 2 caracteres";
      }

      if (!usuario.cedula.trim()) {
        errors.cedula = "La cédula es requerida";
      } else if (!/^\d{10}$/.test(usuario.cedula)) {
        errors.cedula = "La cédula debe contener 10 dígitos";
      }
    }

    if (usuario.role === "empleado") {
      if (!usuario.cargo.trim()) {
        errors.cargo = "El cargo es requerido";
      }
    }

    if (usuario.role === "medico") {
      if (!usuario.correo.trim()) {
        errors.correo = "El correo es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correo)) {
        errors.correo = "Formato de correo inválido";
      }

      if (!usuario.telefono.trim()) {
        errors.telefono = "El teléfono es requerido";
      } else if (!/^\+?[\d\s\-\(\)]{7,15}$/.test(usuario.telefono)) {
        errors.telefono = "Formato de teléfono inválido";
      }

      if (!usuario.especialidadId) {
        errors.especialidadId = "La especialidad es requerida";
      }
    }

    return errors;
  };

  const validateEspecialidad = (
    especialidad: typeof newEspecialidad,
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!especialidad.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    } else if (especialidad.nombre.length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (especialidad.nombre.length > 100) {
      errors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    if (especialidad.descripcion && especialidad.descripcion.length > 500) {
      errors.descripcion = "La descripción no puede exceder 500 caracteres";
    }

    return errors;
  };

  const validateConsulta = (
    consulta: typeof newConsulta,
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!consulta.paciente.trim()) {
      errors.paciente = "El nombre del paciente es requerido";
    } else if (consulta.paciente.length < 2) {
      errors.paciente = "El nombre debe tener al menos 2 caracteres";
    } else if (consulta.paciente.length > 100) {
      errors.paciente = "El nombre no puede exceder 100 caracteres";
    }

    if (!isMedico && !consulta.doctorId) {
      errors.doctorId = "El médico es requerido";
    }

    if (!isMedico && !consulta.centroId) {
      errors.centroId = "El centro es requerido";
    }

    if (!consulta.fecha) {
      errors.fecha = "La fecha es requerida";
    } else {
      const selectedDate = new Date(consulta.fecha);
      const now = new Date();
      const minDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      if (selectedDate < minDate) {
        errors.fecha = "La fecha no puede ser más de 24 horas en el pasado";
      }
    }

    if (consulta.notas && consulta.notas.length > 1000) {
      errors.notas = "Las notas no pueden exceder 1000 caracteres";
    }

    return errors;
  };

  // Form completion check functions
  const isCentroFormComplete = () => {
    return (
      newCentro.nombre.trim() !== "" &&
      newCentro.direccion.trim() !== "" &&
      newCentro.ciudad.trim() !== "" &&
      newCentro.telefono.trim() !== ""
    );
  };

  const isUsuarioFormComplete = () => {
    // Basic fields required for all users
    if (!newUsuario.username.trim() || !newUsuario.password.trim()) {
      return false;
    }

    // Additional fields for employees and doctors
    if (newUsuario.role === "medico" || newUsuario.role === "empleado") {
      if (
        !newUsuario.centroId ||
        !newUsuario.nombre.trim() ||
        !newUsuario.cedula.trim()
      ) {
        return false;
      }
    }

    // Employee specific fields
    if (newUsuario.role === "empleado") {
      if (!newUsuario.cargo.trim()) {
        return false;
      }
    }

    // Doctor specific fields
    if (newUsuario.role === "medico") {
      if (
        !newUsuario.correo.trim() ||
        !newUsuario.telefono.trim() ||
        !newUsuario.especialidadId
      ) {
        return false;
      }
    }

    return true;
  };

  const isEspecialidadFormComplete = () => {
    return (
      newEspecialidad.nombre.trim() !== "" &&
      newEspecialidad.descripcion.trim() !== ""
    );
  };

  const isConsultaFormComplete = () => {
    if (!newConsulta.paciente.trim() || !newConsulta.fecha) {
      return false;
    }

    // For non-doctors, doctor and center are required
    if (!isMedico) {
      if (!newConsulta.doctorId || !newConsulta.centroId) {
        return false;
      }
    }

    return true;
  };

  // Reset form function
  const resetUsuarioForm = () => {
    setNewUsuario({
      username: "",
      password: "",
      role: "empleado",
      centroId: "",
      nombre: "",
      cedula: "",
      cargo: "",
      correo: "",
      telefono: "",
      especialidadId: "",
    });
    setUsuarioErrors({});
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "overview") {
        // Load dashboard statistics
        await loadDashboardStats();
      } else if (activeTab === "centros" && isAdmin) {
        const response = await adminAPI.getCentros();
        setCentros(response.data);
      } else if (activeTab === "usuarios" && isAdmin) {
        const response = await adminAPI.getUsuarios();
        setUsuarios(response.data);
        // También cargar empleados y médicos para mostrarlos en la vista unificada
        const empleadosResponse = await adminAPI.getEmpleados();
        setEmpleados(empleadosResponse.data);
        const medicosResponse = await adminAPI.getMedicos();
        setMedicos(medicosResponse.data);
      } else if (activeTab === "especialidades" && isAdmin) {
        const response = await adminAPI.getEspecialidades();
        setEspecialidades(response.data);
      } else if (activeTab === "consultas") {
        const response = await consultasAPI.getConsultas();
        setConsultas(response.data);
      } else if (activeTab === "reportes" && isAdmin) {
        // Load specialties and centers for dropdowns
        const [centrosRes, medicosRes] = await Promise.all([
          adminAPI.getCentros(),
          adminAPI.getMedicos(),
        ]);
        setCentros(centrosRes.data);
        setMedicos(medicosRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [centrosRes, medicosRes, consultasRes] = await Promise.all([
        isAdmin ? adminAPI.getCentros() : Promise.resolve({ data: [] }),
        isAdmin ? adminAPI.getMedicos() : Promise.resolve({ data: [] }),
        consultasAPI.getConsultas(),
      ]);

      const centrosData = centrosRes.data || [];
      const medicosData = medicosRes.data || [];
      const consultasData = consultasRes.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const consultasHoy = consultasData.filter((consulta: Consulta) => {
        const consultaDate = new Date(consulta.fecha);
        return consultaDate >= today && consultaDate < tomorrow;
      });

      const consultasPendientes = consultasData.filter(
        (consulta: Consulta) => consulta.estado === "programada",
      );

      const consultasCompletadas = consultasData.filter(
        (consulta: Consulta) => consulta.estado === "completada",
      );

      const recentConsultas = consultasData
        .sort(
          (a: Consulta, b: Consulta) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        )
        .slice(0, 5);

      setDashboardStats({
        totalCentros: centrosData.length,
        totalMedicos: medicosData.length,
        totalConsultas: consultasData.length,
        consultasHoy: consultasHoy.length,
        consultasPendientes: consultasPendientes.length,
        consultasCompletadas: consultasCompletadas.length,
        recentConsultas,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  const handleCreateCentro = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateCentro(newCentro);
    setCentroErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await adminAPI.createCentro(newCentro);
      setNewCentro({ nombre: "", direccion: "", ciudad: "", telefono: "" });
      setCentroErrors({});
      loadInitialData();
      alert("Centro creado exitosamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creando centro");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateUsuario(newUsuario);
    setUsuarioErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Crear el usuario básico
      const userData = {
        username: newUsuario.username,
        password: newUsuario.password,
        role: newUsuario.role,
        centroId: newUsuario.centroId ? parseInt(newUsuario.centroId) : null,
      };

      const userResponse = await adminAPI.createUsuario(userData);
      const userId = userResponse.data.id;

      // 2. Crear registro específico según el tipo de usuario
      if (newUsuario.role === "medico") {
        const medicoData = {
          nombre: newUsuario.nombre,
          cedula: newUsuario.cedula,
          correo: newUsuario.correo,
          telefono: newUsuario.telefono,
          especialidad: { id: parseInt(newUsuario.especialidadId) },
          centro: { id: parseInt(newUsuario.centroId) },
        };
        await adminAPI.createMedico(medicoData);
      } else if (newUsuario.role === "empleado") {
        const empleadoData = {
          nombre: newUsuario.nombre,
          cedula: newUsuario.cedula,
          cargo: newUsuario.cargo,
          centro: { id: parseInt(newUsuario.centroId) },
        };
        await adminAPI.createEmpleado(empleadoData);
      }

      resetUsuarioForm();
      loadInitialData();
      alert(
        `${newUsuario.role === "admin" ? "Administrador" : newUsuario.role === "medico" ? "Médico" : "Empleado"} creado exitosamente`,
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsulta = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateConsulta(newConsulta);
    setConsultaErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const consultaData = {
        paciente: newConsulta.paciente,
        fecha: newConsulta.fecha,
        notas: newConsulta.notas,
        estado: newConsulta.estado,
        doctorId:
          isMedico && currentDoctor
            ? currentDoctor.id
            : parseInt(newConsulta.doctorId),
        centroId:
          isMedico && currentDoctor
            ? currentDoctor.centro.id
            : parseInt(newConsulta.centroId),
      };

      console.log("Sending consulta data:", consultaData); // Debug log

      await consultasAPI.createConsulta(consultaData);
      setNewConsulta({
        paciente: "",
        doctorId: "",
        centroId: "",
        fecha: "",
        notas: "",
        estado: "programada",
      });
      setConsultaErrors({});
      loadInitialData();
      alert("Consulta creada exitosamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creando consulta");
    } finally {
      setLoading(false);
    }
  };

  // DELETE functions
  const handleDelete = async (type: string, id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este elemento?"))
      return;

    setLoading(true);
    try {
      switch (type) {
        case "centro":
          await adminAPI.deleteCentro(id);
          break;
        case "usuario":
          await adminAPI.deleteUsuario(id);
          break;
        case "empleado":
          await adminAPI.deleteEmpleado(id);
          break;
        case "medico":
          await adminAPI.deleteMedico(id);
          break;
        case "especialidad":
          await adminAPI.deleteEspecialidad(id);
          break;
        case "consulta":
          await consultasAPI.deleteConsulta(id);
          break;
      }
      loadInitialData();
      alert("Elemento eliminado exitosamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error eliminando elemento");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE functions
  const handleUpdate = async (type: string, id: number, data: any) => {
    setLoading(true);
    try {
      switch (type) {
        case "centro":
          await adminAPI.updateCentro(id, data);
          break;
        case "usuario":
          await adminAPI.updateUsuario(id, data);
          break;
        case "empleado":
          await adminAPI.updateEmpleado(id, data);
          break;
        case "medico":
          await adminAPI.updateMedico(id, data);
          break;
        case "especialidad":
          await adminAPI.updateEspecialidad(id, data);
          break;
        case "consulta":
          await consultasAPI.updateConsulta(id, data);
          break;
      }
      setEditingItem(null);
      loadInitialData();
      alert("Elemento actualizado exitosamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error actualizando elemento");
    } finally {
      setLoading(false);
    }
  };

  // CREATE functions for new entities
  const handleCreateEspecialidad = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateEspecialidad(newEspecialidad);
    setEspecialidadErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await adminAPI.createEspecialidad(newEspecialidad);
      setNewEspecialidad({ nombre: "", descripcion: "" });
      setEspecialidadErrors({});
      loadInitialData();
      alert("Especialidad creada exitosamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creando especialidad");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadReport = async (
    doctorId: number,
    from?: string,
    to?: string,
  ) => {
    setLoading(true);
    try {
      console.log('Loading report for doctorId:', doctorId);
      const response = await consultasAPI.getReportByDoctor(doctorId, from, to);
      console.log('API Response:', response.data);
      console.log('Consultas found:', response.data.consultas?.length || 0);
      setReportes(response.data.consultas || []);

      // Set the selected doctor for the PDF generation
      const doctor = medicos.find((m) => m.id === doctorId);
      setSelectedDoctorForReport(doctor || null);
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.message || "Error cargando reporte");
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    if (!selectedDoctorForReport || reportes.length === 0) {
      alert("No hay datos para generar el reporte");
      return;
    }

    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(20);
    doc.text("Reporte Médico", 20, 20);

    // Información del médico
    doc.setFontSize(14);
    doc.text(`Doctor: ${selectedDoctorForReport.nombre}`, 20, 35);
    doc.text(
      `Especialidad: ${selectedDoctorForReport.especialidad?.nombre || "N/A"}`,
      20,
      45,
    );
    doc.text(
      `Centro: ${selectedDoctorForReport.centro?.nombre || "N/A"}`,
      20,
      55,
    );
    doc.text(
      `Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`,
      20,
      65,
    );

    // Estadísticas
    const totalConsultas = reportes.length;
    const consultasCompletadas = reportes.filter(
      (c) => c.estado === "completada",
    ).length;
    const consultasPendientes = reportes.filter(
      (c) => c.estado === "programada",
    ).length;
    const consultasCanceladas = reportes.filter(
      (c) => c.estado === "cancelada",
    ).length;

    doc.setFontSize(12);
    doc.text("Resumen Estadístico:", 20, 80);
    doc.text(`Total de consultas: ${totalConsultas}`, 25, 90);
    doc.text(`Completadas: ${consultasCompletadas}`, 25, 100);
    doc.text(`Pendientes: ${consultasPendientes}`, 25, 110);
    doc.text(`Canceladas: ${consultasCanceladas}`, 25, 120);

    // Tabla de consultas
    let yPosition = 140;
    doc.text("Detalle de Consultas:", 20, yPosition);
    yPosition += 10;

    // Cabecera de tabla
    doc.setFontSize(10);
    doc.text("ID", 20, yPosition);
    doc.text("Paciente", 40, yPosition);
    doc.text("Fecha", 90, yPosition);
    doc.text("Estado", 140, yPosition);
    doc.text("Notas", 170, yPosition);
    yPosition += 10;

    // Línea separadora
    doc.line(20, yPosition - 5, 190, yPosition - 5);

    // Datos de las consultas
    reportes.forEach((consulta, index) => {
      if (yPosition > 270) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }

      const fecha = new Date(consulta.fecha).toLocaleDateString("es-ES");
      const notasCortas = consulta.notas
        ? consulta.notas.length > 15
          ? consulta.notas.substring(0, 15) + "..."
          : consulta.notas
        : "Sin notas";

      doc.text(consulta.id.toString(), 20, yPosition);
      doc.text(
        consulta.paciente.length > 20
          ? consulta.paciente.substring(0, 20) + "..."
          : consulta.paciente,
        40,
        yPosition,
      );
      doc.text(fecha, 90, yPosition);
      doc.text(consulta.estado, 140, yPosition);
      doc.text(notasCortas, 170, yPosition);
      yPosition += 8;
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 170, 290);
      doc.text("Sistema de Gestión Hospitalaria", 20, 290);
    }

    const fileName = `reporte_${selectedDoctorForReport.nombre.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  const renderOverview = () => (
    <div className="overview">
      <div className="welcome-section">
        <h3>Bienvenido, {user?.username}</h3>
        <div className="user-info">
          <p>
            <strong>Rol:</strong>{" "}
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </p>
          <p>
            <strong>Centro ID:</strong> {user?.centroId || "No asignado"}
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-section">
        <h4>Estadísticas del Sistema</h4>
        <div className="stats-grid">
          {isAdmin && (
            <>
              <div className="stat-card">
                <div className="stat-number">{dashboardStats.totalCentros}</div>
                <div className="stat-label">Centros Médicos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{dashboardStats.totalMedicos}</div>
                <div className="stat-label">Médicos Registrados</div>
              </div>
            </>
          )}
          <div className="stat-card">
            <div className="stat-number">{dashboardStats.totalConsultas}</div>
            <div className="stat-label">Total Consultas</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-number">{dashboardStats.consultasHoy}</div>
            <div className="stat-label">Consultas Hoy</div>
          </div>
        </div>
      </div>

      {/* Métricas de consultas */}
      <div className="metrics-section">
        <h4>Estado de Consultas</h4>
        <div className="metrics-grid">
          <div className="metric-card pending">
            <div className="metric-number">
              {dashboardStats.consultasPendientes}
            </div>
            <div className="metric-label">Pendientes</div>
          </div>
          <div className="metric-card completed">
            <div className="metric-number">
              {dashboardStats.consultasCompletadas}
            </div>
            <div className="metric-label">Completadas</div>
          </div>
          <div className="metric-card progress">
            <div className="metric-number">
              {dashboardStats.totalConsultas > 0
                ? Math.round(
                    (dashboardStats.consultasCompletadas /
                      dashboardStats.totalConsultas) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="metric-label">Tasa de Completadas</div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="recent-activity">
        <h4>Consultas Recientes</h4>
        {dashboardStats.recentConsultas.length === 0 ? (
          <p className="no-data">No hay consultas recientes</p>
        ) : (
          <div className="activity-list">
            {dashboardStats.recentConsultas.map((consulta) => (
              <div key={consulta.id} className="activity-item">
                <div className="activity-info">
                  <span className="patient-name">{consulta.paciente}</span>
                  <span className="activity-date">
                    {new Date(consulta.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className={`status-badge ${consulta.estado}`}>
                  {consulta.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h4>Acciones Rápidas</h4>
        <div className="action-buttons">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab("centros")}
                className="action-btn primary"
              >
                Gestionar Centros
              </button>
              <button
                onClick={() => setActiveTab("usuarios")}
                className="action-btn primary"
              >
                Gestionar Usuarios
              </button>
              <button
                onClick={() => setActiveTab("especialidades")}
                className="action-btn secondary"
              >
                Especialidades
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("consultas")}
            className="action-btn primary"
          >
            Gestionar Consultas
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("reportes")}
              className="action-btn secondary"
            >
              Ver Reportes
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderCentros = () => (
    <div className="centros-section">
      <h3>Gestión de Centros</h3>

      <form onSubmit={handleCreateCentro} className="create-form">
        <h4>Crear nuevo centro</h4>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Nombre"
              value={newCentro.nombre}
              onChange={(e) =>
                setNewCentro({ ...newCentro, nombre: e.target.value })
              }
              required
              className={centroErrors.nombre ? "error" : ""}
            />
            {centroErrors.nombre && (
              <span className="error-message">{centroErrors.nombre}</span>
            )}
          </div>
          <div className="form-field">
            <input
              type="text"
              placeholder="Dirección"
              value={newCentro.direccion}
              onChange={(e) =>
                setNewCentro({ ...newCentro, direccion: e.target.value })
              }
              className={centroErrors.direccion ? "error" : ""}
            />
            {centroErrors.direccion && (
              <span className="error-message">{centroErrors.direccion}</span>
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Ciudad"
              value={newCentro.ciudad}
              onChange={(e) =>
                setNewCentro({ ...newCentro, ciudad: e.target.value })
              }
              className={centroErrors.ciudad ? "error" : ""}
            />
            {centroErrors.ciudad && (
              <span className="error-message">{centroErrors.ciudad}</span>
            )}
          </div>
          <div className="form-field">
            <input
              type="number"
              placeholder="Teléfono"
              value={newCentro.telefono}
              onChange={(e) =>
                setNewCentro({ ...newCentro, telefono: e.target.value })
              }
              className={centroErrors.telefono ? "error" : ""}
            />
            {centroErrors.telefono && (
              <span className="error-message">{centroErrors.telefono}</span>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isCentroFormComplete()}
          className="submit-btn"
        >
          Crear Centro
        </button>
      </form>

      <div className="data-list">
        <h4>Centros Existentes</h4>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centros.map((centro) => (
                  <tr key={centro.id}>
                    <td>{centro.id}</td>
                    <td>
                      {editingItem?.id === centro.id &&
                      editingItem?.type === "centro" ? (
                        <input
                          value={editingItem.nombre}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              nombre: e.target.value,
                            })
                          }
                        />
                      ) : (
                        centro.nombre
                      )}
                    </td>
                    <td>
                      {editingItem?.id === centro.id &&
                      editingItem?.type === "centro" ? (
                        <input
                          value={editingItem.direccion}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              direccion: e.target.value,
                            })
                          }
                        />
                      ) : (
                        centro.direccion
                      )}
                    </td>
                    <td>
                      {editingItem?.id === centro.id &&
                      editingItem?.type === "centro" ? (
                        <input
                          value={editingItem.ciudad}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              ciudad: e.target.value,
                            })
                          }
                        />
                      ) : (
                        centro.ciudad
                      )}
                    </td>
                    <td>
                      {editingItem?.id === centro.id &&
                      editingItem?.type === "centro" ? (
                        <input
                          value={editingItem.telefono}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              telefono: e.target.value,
                            })
                          }
                        />
                      ) : (
                        centro.telefono
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingItem?.id === centro.id &&
                        editingItem?.type === "centro" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdate("centro", centro.id, {
                                  nombre: editingItem.nombre,
                                  direccion: editingItem.direccion,
                                  ciudad: editingItem.ciudad,
                                  telefono: editingItem.telefono,
                                })
                              }
                              className="save-btn"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="cancel-btn"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingItem({ ...centro, type: "centro" })
                              }
                              className="edit-btn"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                setViewingItem({ ...centro, type: "centro" })
                              }
                              className="view-btn"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleDelete("centro", centro.id)}
                              className="delete-btn"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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

  const renderUsuarios = () => (
    <div className="usuarios-section">
      <h3>Gestión de usuarios y personal</h3>

      <form onSubmit={handleCreateUsuario} className="create-form">
        <h4>Crear nuevo usuario</h4>

        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Usuario"
              value={newUsuario.username}
              onChange={(e) =>
                setNewUsuario({ ...newUsuario, username: e.target.value })
              }
              required
              className={usuarioErrors.username ? "error" : ""}
            />
            {usuarioErrors.username && (
              <span className="error-message">{usuarioErrors.username}</span>
            )}
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Contraseña"
              value={newUsuario.password}
              onChange={(e) =>
                setNewUsuario({ ...newUsuario, password: e.target.value })
              }
              required
              className={usuarioErrors.password ? "error" : ""}
            />
            {usuarioErrors.password && (
              <span className="error-message">{usuarioErrors.password}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <select
              value={newUsuario.role}
              onChange={(e) => {
                setNewUsuario({ ...newUsuario, role: e.target.value });
              }}
              required
              className={usuarioErrors.role ? "error" : ""}
            >
              <option value="empleado">Empleado</option>
              <option value="medico">Médico</option>
              <option value="admin">Administrador</option>
            </select>
            {usuarioErrors.role && (
              <span className="error-message">{usuarioErrors.role}</span>
            )}
          </div>

          {/* Centro solo para médicos y empleados */}
          {(newUsuario.role === "medico" || newUsuario.role === "empleado") && (
            <div className="form-field">
              <select
                value={newUsuario.centroId}
                onChange={(e) =>
                  setNewUsuario({ ...newUsuario, centroId: e.target.value })
                }
                required
                className={usuarioErrors.centroId ? "error" : ""}
              >
                <option value="">Seleccionar Centro</option>
                {centros.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
              {usuarioErrors.centroId && (
                <span className="error-message">{usuarioErrors.centroId}</span>
              )}
            </div>
          )}
        </div>

        {/* Campos específicos para empleados y médicos */}
        {(newUsuario.role === "medico" || newUsuario.role === "empleado") && (
          <>
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={newUsuario.nombre}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, nombre: e.target.value })
                  }
                  required
                  className={usuarioErrors.nombre ? "error" : ""}
                />
                {usuarioErrors.nombre && (
                  <span className="error-message">{usuarioErrors.nombre}</span>
                )}
              </div>
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Cédula"
                  value={newUsuario.cedula}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, cedula: e.target.value })
                  }
                  required
                  className={usuarioErrors.cedula ? "error" : ""}
                />
                {usuarioErrors.cedula && (
                  <span className="error-message">{usuarioErrors.cedula}</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Campos específicos para empleados */}
        {newUsuario.role === "empleado" && <div className="form-row"></div>}

        {/* Campos específicos para médicos */}
        {newUsuario.role === "medico" && (
          <>
            <div className="form-row">
              <div className="form-field">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={newUsuario.correo}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, correo: e.target.value })
                  }
                  required
                  className={usuarioErrors.correo ? "error" : ""}
                />
                {usuarioErrors.correo && (
                  <span className="error-message">{usuarioErrors.correo}</span>
                )}
              </div>
              <div className="form-field">
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={newUsuario.telefono}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, telefono: e.target.value })
                  }
                  required
                  className={usuarioErrors.telefono ? "error" : ""}
                />
                {usuarioErrors.telefono && (
                  <span className="error-message">
                    {usuarioErrors.telefono}
                  </span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <select
                  value={newUsuario.especialidadId}
                  onChange={(e) =>
                    setNewUsuario({
                      ...newUsuario,
                      especialidadId: e.target.value,
                    })
                  }
                  required
                  className={usuarioErrors.especialidadId ? "error" : ""}
                >
                  <option value="">Seleccionar Especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
                {usuarioErrors.especialidadId && (
                  <span className="error-message">
                    {usuarioErrors.especialidadId}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!isUsuarioFormComplete()}
          className="submit-btn"
        >
          {`Crear ${newUsuario.role === "admin" ? "Administrador" : newUsuario.role === "medico" ? "Médico" : "Empleado"}`}
        </button>
      </form>

      <div className="data-list">
        <h4>Usuarios Existentes</h4>
        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Centro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>
                      {editingItem?.id === usuario.id &&
                      editingItem?.type === "usuario" ? (
                        <input
                          value={editingItem.username}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              username: e.target.value,
                            })
                          }
                        />
                      ) : (
                        usuario.username
                      )}
                    </td>
                    <td>
                      {editingItem?.id === usuario.id &&
                      editingItem?.type === "usuario" ? (
                        <select
                          value={editingItem.role}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="empleado">Empleado</option>
                          <option value="medico">Médico</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${usuario.role}`}>
                          {usuario.role}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingItem?.id === usuario.id &&
                      editingItem?.type === "usuario" ? (
                        <input
                          type="number"
                          value={editingItem.centroId || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              centroId: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                        />
                      ) : (
                        usuario.centroId || "N/A"
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingItem?.id === usuario.id &&
                        editingItem?.type === "usuario" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdate("usuario", usuario.id, {
                                  username: editingItem.username,
                                  role: editingItem.role,
                                  centroId: editingItem.centroId,
                                })
                              }
                              className="save-btn"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="cancel-btn"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingItem({ ...usuario, type: "usuario" })
                              }
                              className="edit-btn"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                setViewingItem({ ...usuario, type: "usuario" })
                              }
                              className="view-btn"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() =>
                                handleDelete("usuario", usuario.id)
                              }
                              className="delete-btn"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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

  const renderEspecialidades = () => (
    <div className="especialidades-section">
      <h3>Gestión de Especialidades</h3>

      <form onSubmit={handleCreateEspecialidad} className="create-form">
        <h4>Crear nueva especialidad</h4>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Nombre"
              value={newEspecialidad.nombre}
              onChange={(e) =>
                setNewEspecialidad({
                  ...newEspecialidad,
                  nombre: e.target.value,
                })
              }
              required
              className={especialidadErrors.nombre ? "error" : ""}
            />
            {especialidadErrors.nombre && (
              <span className="error-message">{especialidadErrors.nombre}</span>
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <textarea
              placeholder="Descripción"
              value={newEspecialidad.descripcion}
              onChange={(e) =>
                setNewEspecialidad({
                  ...newEspecialidad,
                  descripcion: e.target.value,
                })
              }
              rows={3}
              className={especialidadErrors.descripcion ? "error" : ""}
            />
            {especialidadErrors.descripcion && (
              <span className="error-message">
                {especialidadErrors.descripcion}
              </span>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isEspecialidadFormComplete()}
          className="submit-btn"
        >
          Crear Especialidad
        </button>
      </form>

      <div className="data-list">
        <h4>Especialidades Existentes</h4>
        {especialidades.length === 0 ? (
          <p>No hay especialidades registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {especialidades.map((especialidad) => (
                  <tr key={especialidad.id}>
                    <td>{especialidad.id}</td>
                    <td>
                      {editingItem?.id === especialidad.id &&
                      editingItem?.type === "especialidad" ? (
                        <input
                          value={editingItem.nombre}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              nombre: e.target.value,
                            })
                          }
                        />
                      ) : (
                        especialidad.nombre
                      )}
                    </td>
                    <td>
                      {editingItem?.id === especialidad.id &&
                      editingItem?.type === "especialidad" ? (
                        <textarea
                          value={editingItem.descripcion}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              descripcion: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      ) : (
                        especialidad.descripcion
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingItem?.id === especialidad.id &&
                        editingItem?.type === "especialidad" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdate("especialidad", especialidad.id, {
                                  nombre: editingItem.nombre,
                                  descripcion: editingItem.descripcion,
                                })
                              }
                              className="save-btn"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="cancel-btn"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingItem({
                                  ...especialidad,
                                  type: "especialidad",
                                })
                              }
                              className="edit-btn"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDelete("especialidad", especialidad.id)
                              }
                              className="delete-btn"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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

  const renderReportes = () => (
    <div className="reportes-section">
      <h3>Reportes Médicos</h3>

      <div className="filters-form">
        <h4>Doctores</h4>
        <div className="form-row">
          <select
            onChange={(e) => {
              if (e.target.value && e.target.value !== "") {
                const doctorId = parseInt(e.target.value);
                if (!isNaN(doctorId)) {
                  handleLoadReport(doctorId);
                }
              }
            }}
          >
            <option value="">Seleccionar Doctor</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                Dr/a. {medico.nombre} - {medico.especialidad?.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="data-list">
        {reportes.length === 0 ? (
          <p>Seleccione un doctor para ver su reporte.</p>
        ) : (
          <div className="table-container">
            <div className="report-header">
              <h4>Consultas del Médico</h4>
              <button
                onClick={generatePDFReport}
                className="pdf-download-btn"
                disabled={!selectedDoctorForReport || reportes.length === 0}
              >
                Descargar PDF
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{consulta.id}</td>
                    <td>{consulta.paciente}</td>
                    <td>{new Date(consulta.fecha).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${consulta.estado}`}>
                        {consulta.estado}
                      </span>
                    </td>
                    <td>{consulta.notas || "Sin notas"}</td>
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
      <h3>Gestión de Consultas</h3>

      <form onSubmit={handleCreateConsulta} className="create-form">
        <h4>Crear Nueva Consulta</h4>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Nombre del paciente"
              value={newConsulta.paciente}
              onChange={(e) =>
                setNewConsulta({ ...newConsulta, paciente: e.target.value })
              }
              required
              className={consultaErrors.paciente ? "error" : ""}
            />
            {consultaErrors.paciente && (
              <span className="error-message">{consultaErrors.paciente}</span>
            )}
          </div>
          {!isMedico && (
            <div className="form-field">
              <select
                value={newConsulta.doctorId}
                onChange={(e) =>
                  setNewConsulta({ ...newConsulta, doctorId: e.target.value })
                }
                required
                className={consultaErrors.doctorId ? "error" : ""}
              >
                <option value="">Seleccionar Médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    Dr/a. {medico.nombre} - {medico.especialidad?.nombre}
                  </option>
                ))}
              </select>
              {consultaErrors.doctorId && (
                <span className="error-message">{consultaErrors.doctorId}</span>
              )}
            </div>
          )}
          {isMedico && currentDoctor && (
            <div className="auto-populated-field">
              <strong>Médico:</strong> Dr/a. {currentDoctor.nombre} -{" "}
              {currentDoctor.especialidad?.nombre}
            </div>
          )}
        </div>
        <div className="form-row">
          {!isMedico && (
            <div className="form-field">
              <select
                value={newConsulta.centroId}
                onChange={(e) =>
                  setNewConsulta({ ...newConsulta, centroId: e.target.value })
                }
                required
                className={consultaErrors.centroId ? "error" : ""}
              >
                <option value="">Seleccionar Centro</option>
                {centros.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
              {consultaErrors.centroId && (
                <span className="error-message">{consultaErrors.centroId}</span>
              )}
            </div>
          )}
          {isMedico && currentDoctor && (
            <div className="auto-populated-field">
              <strong>Centro:</strong> {currentDoctor.centro.nombre}
            </div>
          )}
          <div className="form-field">
            <input
              type="datetime-local"
              value={newConsulta.fecha}
              onChange={(e) =>
                setNewConsulta({ ...newConsulta, fecha: e.target.value })
              }
              required
              className={consultaErrors.fecha ? "error" : ""}
            />
            {consultaErrors.fecha && (
              <span className="error-message">{consultaErrors.fecha}</span>
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <textarea
              placeholder="Notas (opcional)"
              value={newConsulta.notas}
              onChange={(e) =>
                setNewConsulta({ ...newConsulta, notas: e.target.value })
              }
              rows={3}
              className={consultaErrors.notas ? "error" : ""}
            />
            {consultaErrors.notas && (
              <span className="error-message">{consultaErrors.notas}</span>
            )}
          </div>
          <div className="form-field">
            <select
              value={newConsulta.estado}
              onChange={(e) =>
                setNewConsulta({ ...newConsulta, estado: e.target.value })
              }
              className={consultaErrors.estado ? "error" : ""}
            >
              <option value="programada">Programada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            {consultaErrors.estado && (
              <span className="error-message">{consultaErrors.estado}</span>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isConsultaFormComplete()}
          className="submit-btn"
        >
          Crear Consulta
        </button>
      </form>

      <div className="data-list">
        <h4>Consultas {isMedico ? "(Solo tu centro)" : ""}</h4>
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
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{consulta.id}</td>
                    <td>
                      {editingItem?.id === consulta.id &&
                      editingItem?.type === "consulta" ? (
                        <input
                          value={editingItem.paciente}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              paciente: e.target.value,
                            })
                          }
                        />
                      ) : (
                        consulta.paciente
                      )}
                    </td>
                    <td>{consulta.doctorId}</td>
                    <td>{consulta.centroId}</td>
                    <td>
                      {editingItem?.id === consulta.id &&
                      editingItem?.type === "consulta" ? (
                        <input
                          type="datetime-local"
                          value={
                            editingItem.fecha
                              ? editingItem.fecha.slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              fecha: e.target.value,
                            })
                          }
                        />
                      ) : (
                        new Date(consulta.fecha).toLocaleString()
                      )}
                    </td>
                    <td>
                      {editingItem?.id === consulta.id &&
                      editingItem?.type === "consulta" ? (
                        <select
                          value={editingItem.estado}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              estado: e.target.value,
                            })
                          }
                        >
                          <option value="programada">Programada</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${consulta.estado}`}>
                          {consulta.estado}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingItem?.id === consulta.id &&
                      editingItem?.type === "consulta" ? (
                        <textarea
                          value={editingItem.notas || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              notas: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      ) : consulta.notas ? (
                        <span title={consulta.notas}>
                          {consulta.notas.length > 30
                            ? consulta.notas.substring(0, 30) + "..."
                            : consulta.notas}
                        </span>
                      ) : (
                        "Sin notas"
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingItem?.id === consulta.id &&
                        editingItem?.type === "consulta" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdate("consulta", consulta.id, {
                                  paciente: editingItem.paciente,
                                  fecha: editingItem.fecha,
                                  estado: editingItem.estado,
                                  notas: editingItem.notas,
                                })
                              }
                              className="save-btn"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="cancel-btn"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingItem({
                                  ...consulta,
                                  type: "consulta",
                                })
                              }
                              className="edit-btn"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                setViewingItem({
                                  ...consulta,
                                  type: "consulta",
                                })
                              }
                              className="view-btn"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() =>
                                handleDelete("consulta", consulta.id)
                              }
                              className="delete-btn"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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

  const renderModal = () => {
    if (!viewingItem) return null;

    return (
      <div className="modal-overlay" onClick={() => setViewingItem(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {viewingItem.type === "centro" && "Detalles del Centro"}
              {viewingItem.type === "usuario" && "Detalles del Usuario"}
              {viewingItem.type === "empleado" && "Detalles del Empleado"}
              {viewingItem.type === "medico" && "Detalles del Médico"}
              {viewingItem.type === "consulta" && "Detalles de la Consulta"}
            </h3>
            <button onClick={() => setViewingItem(null)} className="close-btn">
              Cerrar
            </button>
          </div>

          <div className="modal-body">
            {viewingItem.type === "centro" && (
              <div className="details-grid">
                <div>
                  <strong>ID:</strong> {viewingItem.id}
                </div>
                <div>
                  <strong>Nombre:</strong> {viewingItem.nombre}
                </div>
                <div>
                  <strong>Dirección:</strong> {viewingItem.direccion}
                </div>
                <div>
                  <strong>Ciudad:</strong> {viewingItem.ciudad}
                </div>
                <div>
                  <strong>Teléfono:</strong> {viewingItem.telefono}
                </div>
              </div>
            )}

            {viewingItem.type === "usuario" && (
              <div className="details-grid">
                <div>
                  <strong>ID:</strong> {viewingItem.id}
                </div>
                <div>
                  <strong>Username:</strong> {viewingItem.username}
                </div>
                <div>
                  <strong>Rol:</strong>{" "}
                  <span className={`role-badge ${viewingItem.role}`}>
                    {viewingItem.role}
                  </span>
                </div>
                <div>
                  <strong>Centro ID:</strong>{" "}
                  {viewingItem.centroId || "No asignado"}
                </div>
              </div>
            )}

            {viewingItem.type === "empleado" && (
              <div className="details-grid">
                <div>
                  <strong>ID:</strong> {viewingItem.id}
                </div>
                <div>
                  <strong>Nombre:</strong> {viewingItem.nombre}
                </div>
                <div>
                  <strong>Cédula:</strong> {viewingItem.cedula}
                </div>
                <div>
                  <strong>Centro:</strong> {viewingItem.centro?.nombre}
                </div>
              </div>
            )}

            {viewingItem.type === "medico" && (
              <div className="details-grid">
                <div>
                  <strong>ID:</strong> {viewingItem.id}
                </div>
                <div>
                  <strong>Nombre:</strong> {viewingItem.nombre}
                </div>
                <div>
                  <strong>Cédula:</strong> {viewingItem.cedula}
                </div>
                <div>
                  <strong>Correo:</strong> {viewingItem.correo}
                </div>
                <div>
                  <strong>Teléfono:</strong> {viewingItem.telefono}
                </div>
                <div>
                  <strong>Especialidad:</strong>{" "}
                  {viewingItem.especialidad?.nombre}
                </div>
                <div>
                  <strong>Centro:</strong> {viewingItem.centro?.nombre}
                </div>
              </div>
            )}

            {viewingItem.type === "consulta" && (
              <div className="details-grid">
                <div>
                  <strong>ID:</strong> {viewingItem.id}
                </div>
                <div>
                  <strong>Paciente:</strong> {viewingItem.paciente}
                </div>
                <div>
                  <strong>Doctor ID:</strong> {viewingItem.doctorId}
                </div>
                <div>
                  <strong>Centro ID:</strong> {viewingItem.centroId}
                </div>
                <div>
                  <strong>Fecha:</strong>{" "}
                  {new Date(viewingItem.fecha).toLocaleString()}
                </div>
                <div>
                  <strong>Estado:</strong>{" "}
                  <span className={`status-badge ${viewingItem.estado}`}>
                    {viewingItem.estado}
                  </span>
                </div>
                <div className="notes-section">
                  <strong>Notas:</strong>
                  <div className="notes-content">
                    {viewingItem.notas || "Sin notas adicionales"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-menu">
          <span>
            {user?.username} ({user?.role})
          </span>
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Inicio
        </button>

        {isAdmin && (
          <>
            <button
              className={activeTab === "centros" ? "active" : ""}
              onClick={() => setActiveTab("centros")}
            >
              Centros
            </button>
            <button
              className={activeTab === "usuarios" ? "active" : ""}
              onClick={() => setActiveTab("usuarios")}
            >
              Usuarios y Personal
            </button>
            <button
              className={activeTab === "especialidades" ? "active" : ""}
              onClick={() => setActiveTab("especialidades")}
            >
              Especialidades
            </button>
          </>
        )}

        <button
          className={activeTab === "consultas" ? "active" : ""}
          onClick={() => setActiveTab("consultas")}
        >
          Consultas
        </button>

        {isAdmin && (
          <button
            className={activeTab === "reportes" ? "active" : ""}
            onClick={() => setActiveTab("reportes")}
          >
            Reportes
          </button>
        )}
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}

        {activeTab === "overview" && renderOverview()}
        {activeTab === "centros" && isAdmin && renderCentros()}
        {activeTab === "usuarios" && isAdmin && renderUsuarios()}
        {activeTab === "especialidades" && isAdmin && renderEspecialidades()}
        {activeTab === "consultas" && renderConsultas()}
        {activeTab === "reportes" && isAdmin && renderReportes()}
      </main>

      {renderModal()}
    </div>
  );
};

export default Dashboard;
