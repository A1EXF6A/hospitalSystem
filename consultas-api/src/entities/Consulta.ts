import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("consultas")
export class Consulta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  paciente!: string;

  @Column()
  doctorId!: number; // referencia al id del doctor en admin-api

  @Column()
  centroId!: number; // referencia al id del centro en admin-api

  @Column({ type: "timestamp" })
  fecha!: Date;

  @Column({ nullable: true })
  notas?: string;

  @Column({ default: "programada" })
  estado!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
