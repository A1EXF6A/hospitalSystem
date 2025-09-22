import { Router } from "express";
import { CentroController } from "../controllers/centro.controller";
import { EmpleadoController } from "../controllers/empleado.controller";
import { EspecialidadController } from "../controllers/especialidad.controller";
import { MedicoController } from "../controllers/medico.controller";

const router = Router();

// Centros
router.post("/centros", CentroController.create);
router.get("/centros", CentroController.getAll);
router.get("/centros/:id", CentroController.getOne);
router.put("/centros/:id", CentroController.update);
router.delete("/centros/:id", CentroController.delete);

// Empleados
router.post("/empleados", EmpleadoController.create);
router.get("/empleados", EmpleadoController.getAll);
router.get("/empleados/:id", EmpleadoController.getOne);
router.put("/empleados/:id", EmpleadoController.update);
router.delete("/empleados/:id", EmpleadoController.delete);

// Especialidades
router.post("/especialidades", EspecialidadController.create);
router.get("/especialidades", EspecialidadController.getAll);
router.get("/especialidades/:id", EspecialidadController.getOne);
router.put("/especialidades/:id", EspecialidadController.update);
router.delete("/especialidades/:id", EspecialidadController.delete);

// Medicos
router.post("/medicos", MedicoController.create);
router.get("/medicos", MedicoController.getAll);
router.get("/medicos/:id", MedicoController.getOne);
router.put("/medicos/:id", MedicoController.update);
router.delete("/medicos/:id", MedicoController.delete);

export default router;
