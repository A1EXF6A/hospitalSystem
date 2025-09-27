import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Centro } from "./Centro";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ length: 255 })
  password!: string; // Password hasheado

  @Column({ 
    type: "enum",
    enum: ["admin", "medico", "empleado"],
    default: "empleado"
  })
  role!: "admin" | "medico" | "empleado";

  @Column({ nullable: true })
  centroId!: number | null;

  @ManyToOne(() => Centro, { nullable: true })
  @JoinColumn({ name: "centroId" })
  centro!: Centro | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}