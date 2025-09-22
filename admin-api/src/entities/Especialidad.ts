
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("especialidades")
export class Especialidad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string;
}

