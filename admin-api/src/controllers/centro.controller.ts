import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Centro } from "../entities/Centro";

export class CentroController {
  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Centro);
    const centro = repo.create(req.body);
    await repo.save(centro);
    res.status(201).json(centro);
  }

  static async getAll(_req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Centro);
    const centros = await repo.find();
    res.json(centros);
  }

  static async getOne(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Centro);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ message: "No encontrado" });
    res.json(centro);
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Centro);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ message: "No encontrado" });
    repo.merge(centro, req.body);
    await repo.save(centro);
    res.json(centro);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Centro);
    await repo.delete({ id: Number(req.params.id) });
    res.json({ message: "Centro eliminado" });
  }
}
