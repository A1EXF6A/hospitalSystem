import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Consulta } from "../entities/Consulta";

export class ConsultaController {
  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    const consulta = repo.create(req.body);
    await repo.save(consulta);
    res.status(201).json(consulta);
  }

  static async getAll(_req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    const consultas = await repo.find();
    res.json(consultas);
  }

  static async getOne(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    const consulta = await repo.findOneBy({ id: Number(req.params.id) });
    if (!consulta) return res.status(404).json({ message: "No encontrada" });
    res.json(consulta);
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    const consulta = await repo.findOneBy({ id: Number(req.params.id) });
    if (!consulta) return res.status(404).json({ message: "No encontrada" });
    repo.merge(consulta, req.body);
    await repo.save(consulta);
    res.json(consulta);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    await repo.delete({ id: Number(req.params.id) });
    res.json({ message: "Consulta eliminada" });
  }

  static async reportByDoctor(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Consulta);
    const doctorId = Number(req.params.doctorId);
    const { from, to } = req.query;

    let where: any = { doctorId };
    if (from || to) {
      where.fecha = {};
      if (from) where.fecha.$gte = new Date(String(from));
      if (to) where.fecha.$lte = new Date(String(to));
    }

    const consultas = await repo.find({ where });
    res.json({
      doctorId,
      total: consultas.length,
      consultas,
    });
  }
}
