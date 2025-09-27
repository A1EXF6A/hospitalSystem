import { Router } from "express";
import { ConsultaController } from "../controllers/consulta.controller";
import { authenticateToken, requireMedicoOrAdmin, filterByCentro } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireMedicoOrAdmin);

// CRUD - with centro filtering for medicos
router.post("/consultas", filterByCentro, ConsultaController.create);
router.get("/consultas", filterByCentro, ConsultaController.getAll);
router.get("/consultas/:id", ConsultaController.getOne);
router.put("/consultas/:id", ConsultaController.update);
router.delete("/consultas/:id", ConsultaController.delete);

// Reportes - with centro filtering for medicos
router.get("/reportes/doctor/:doctorId", filterByCentro, ConsultaController.reportByDoctor);

export default router;
