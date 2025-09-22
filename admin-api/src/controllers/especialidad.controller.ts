import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Especialidad } from "../entities/Especialidad";

export class EspecialidadController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Especialidad);
      const especialidad = repo.create(req.body);
      await repo.save(especialidad);
      res.status(201).json(especialidad);
    } catch (error) {
      console.error('Error creating especialidad:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getAll(_req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Especialidad);
      const especialidades = await repo.find();
      res.json(especialidades);
    } catch (error) {
      console.error('Error getting especialidades:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Especialidad);
      const especialidad = await repo.findOneBy({ id: Number(req.params.id) });
      if (!especialidad) return res.status(404).json({ message: "No encontrado" });
      res.json(especialidad);
    } catch (error) {
      console.error('Error getting especialidad:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Especialidad);
      const especialidad = await repo.findOneBy({ id: Number(req.params.id) });
      if (!especialidad) return res.status(404).json({ message: "No encontrado" });
      repo.merge(especialidad, req.body);
      await repo.save(especialidad);
      res.json(especialidad);
    } catch (error) {
      console.error('Error updating especialidad:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Especialidad);
      await repo.delete({ id: Number(req.params.id) });
      res.json({ message: "Especialidad eliminada" });
    } catch (error) {
      console.error('Error deleting especialidad:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
