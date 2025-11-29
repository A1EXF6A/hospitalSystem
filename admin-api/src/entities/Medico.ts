import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Especialidad } from "./Especialidad";
import { Centro } from "./Centro";
import { Usuario } from "./Usuario";

@Entity("medicos")
export class Medico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 20, unique: true })
  cedula!: string;

  @Column({ length: 50 })
  telefono!: string;

  @Column({ nullable: true })
  usuarioId?: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuarioId" })
  usuario?: Usuario;

  @ManyToOne(() => Especialidad)
  @JoinColumn({ name: "especialidad_id" })
  especialidad!: Especialidad;

  @ManyToOne(() => Centro)
  @JoinColumn({ name: "centro_id" })
  centro!: Centro;
}

