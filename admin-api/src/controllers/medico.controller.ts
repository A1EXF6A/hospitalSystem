import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Medico } from "../entities/Medico";

export class MedicoController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Medico);
      const medico = repo.create(req.body);
      await repo.save(medico);
      res.status(201).json(medico);
    } catch (error) {
      console.error('Error creating medico:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getAll(_req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Medico);
      const medicos = await repo.find({ relations: ["especialidad", "centro"] });
      res.json(medicos);
    } catch (error) {
      console.error('Error getting medicos:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Medico);
      const medico = await repo.findOne({
        where: { id: Number(req.params.id) },
        relations: ["especialidad", "centro"],
      });
      if (!medico) return res.status(404).json({ message: "No encontrado" });
      res.json(medico);
    } catch (error) {
      console.error('Error getting medico:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Medico);
      const medico = await repo.findOneBy({ id: Number(req.params.id) });
      if (!medico) return res.status(404).json({ message: "No encontrado" });
      repo.merge(medico, req.body);
      await repo.save(medico);
      res.json(medico);
    } catch (error) {
      console.error('Error updating medico:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Medico);
      await repo.delete({ id: Number(req.params.id) });
      res.json({ message: "Medico eliminado" });
    } catch (error) {
      console.error('Error deleting medico:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
