import { Router } from "express";
import { ConsultaController } from "../controllers/consulta.controller";

const router = Router();

// CRUD
router.post("/consultas", ConsultaController.create);
router.get("/consultas", ConsultaController.getAll);
router.get("/consultas/:id", ConsultaController.getOne);
router.put("/consultas/:id", ConsultaController.update);
router.delete("/consultas/:id", ConsultaController.delete);

// Reportes
router.get("/reportes/doctor/:doctorId", ConsultaController.reportByDoctor);

export default router;
