import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Especialidad } from "../entities/Especialidad";

export class EspecialidadController {
  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Especialidad);
    const especialidad = repo.create(req.body);
    await repo.save(especialidad);
    res.status(201).json(especialidad);
  }

  static async getAll(_req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Especialidad);
    const especialidades = await repo.find();
    res.json(especialidades);
  }

  static async getOne(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Especialidad);
    const especialidad = await repo.findOneBy({ id: Number(req.params.id) });
    if (!especialidad) return res.status(404).json({ message: "No encontrado" });
    res.json(especialidad);
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Especialidad);
    const especialidad = await repo.findOneBy({ id: Number(req.params.id) });
    if (!especialidad) return res.status(404).json({ message: "No encontrado" });
    repo.merge(especialidad, req.body);
    await repo.save(especialidad);
    res.json(especialidad);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Especialidad);
    await repo.delete({ id: Number(req.params.id) });
    res.json({ message: "Especialidad eliminada" });
  }
}
