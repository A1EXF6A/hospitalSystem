import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Medico } from "../entities/Medico";

export class MedicoController {
  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Medico);
    const medico = repo.create(req.body);
    await repo.save(medico);
    res.status(201).json(medico);
  }

  static async getAll(_req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Medico);
    const medicos = await repo.find({ relations: ["especialidad", "centro"] });
    res.json(medicos);
  }

  static async getOne(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Medico);
    const medico = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["especialidad", "centro"],
    });
    if (!medico) return res.status(404).json({ message: "No encontrado" });
    res.json(medico);
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Medico);
    const medico = await repo.findOneBy({ id: Number(req.params.id) });
    if (!medico) return res.status(404).json({ message: "No encontrado" });
    repo.merge(medico, req.body);
    await repo.save(medico);
    res.json(medico);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Medico);
    await repo.delete({ id: Number(req.params.id) });
    res.json({ message: "Medico eliminado" });
  }
}
