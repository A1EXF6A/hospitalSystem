import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Empleado } from "../entities/Empleado";

export class EmpleadoController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Empleado);
      const empleado = repo.create(req.body);
      await repo.save(empleado);
      res.status(201).json(empleado);
    } catch (error) {
      console.error('Error creating empleado:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getAll(_req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Empleado);
      const empleados = await repo.find({ relations: ["centro"] });
      res.json(empleados);
    } catch (error) {
      console.error('Error getting empleados:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Empleado);
      const empleado = await repo.findOne({
        where: { id: Number(req.params.id) },
        relations: ["centro"],
      });
      if (!empleado) return res.status(404).json({ message: "No encontrado" });
      res.json(empleado);
    } catch (error) {
      console.error('Error getting empleado:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Empleado);
      const empleado = await repo.findOneBy({ id: Number(req.params.id) });
      if (!empleado) return res.status(404).json({ message: "No encontrado" });
      repo.merge(empleado, req.body);
      await repo.save(empleado);
      res.json(empleado);
    } catch (error) {
      console.error('Error updating empleado:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Empleado);
      await repo.delete({ id: Number(req.params.id) });
      res.json({ message: "Empleado eliminado" });
    } catch (error) {
      console.error('Error deleting empleado:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
