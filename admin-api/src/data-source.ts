import "reflect-metadata";
import { DataSource } from "typeorm";
import { Centro } from "./entities/Centro";
import { Medico } from "./entities/Medico";
import { Empleado } from "./entities/Empleado";
import { Especialidad } from "./entities/Especialidad";
import { Usuario } from "./entities/Usuario";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "admin_db",
  synchronize: true,
  logging: true,
  entities: [Centro, Medico, Empleado, Especialidad, Usuario],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
});
