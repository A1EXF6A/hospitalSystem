
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("centros")
export class Centro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 250, nullable: true })
  direccion!: string;

  @Column({ length: 100, nullable: true })
  ciudad!: string;

  @Column({ length: 50, nullable: true })
  telefono!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}

