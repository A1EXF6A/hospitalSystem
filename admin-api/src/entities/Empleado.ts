
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Centro } from "./Centro";

@Entity("empleados")
export class Empleado {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 20, unique: true })
  cedula!: string;

  @Column({ length: 100 })
  cargo!: string;

  @ManyToOne(() => Centro)
  @JoinColumn({ name: "centro_id" })
  centro!: Centro;
}

