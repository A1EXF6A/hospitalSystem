import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDB1764434748917 implements MigrationInterface {
    name = 'CreateDB1764434748917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "centros" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "direccion" character varying(250), "ciudad" character varying(100), "telefono" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6ba93b48fcc983a54ca89432d2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_role_enum" AS ENUM('admin', 'medico', 'empleado')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."usuarios_role_enum" NOT NULL DEFAULT 'empleado', "centroId" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "especialidades" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "descripcion" text, CONSTRAINT "PK_73c2740deb4cbe08c28ac487705" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medicos" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "cedula" character varying(20) NOT NULL, "correo" character varying(150) NOT NULL, "telefono" character varying(50) NOT NULL, "especialidad_id" integer, "centro_id" integer, CONSTRAINT "UQ_ad949c623bce69ae1d92926e8b6" UNIQUE ("cedula"), CONSTRAINT "PK_f16d578e9fd6df731d5e8551725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "empleados" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "cedula" character varying(20) NOT NULL, "cargo" character varying(100) NOT NULL, "centro_id" integer, CONSTRAINT "UQ_531b62206ec48fc3ba88593af3a" UNIQUE ("cedula"), CONSTRAINT "PK_73a63a6fcb4266219be3eb0ce8a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_0d25ecbf9e1d6ac6b925d6c8e10" FOREIGN KEY ("centroId") REFERENCES "centros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medicos" ADD CONSTRAINT "FK_b348ac93bc12e810de99ecc6594" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medicos" ADD CONSTRAINT "FK_32275ef0879a64951f570b6f202" FOREIGN KEY ("centro_id") REFERENCES "centros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empleados" ADD CONSTRAINT "FK_6a09795d3a50a22c3a9a6f1cdf2" FOREIGN KEY ("centro_id") REFERENCES "centros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "empleados" DROP CONSTRAINT "FK_6a09795d3a50a22c3a9a6f1cdf2"`);
        await queryRunner.query(`ALTER TABLE "medicos" DROP CONSTRAINT "FK_32275ef0879a64951f570b6f202"`);
        await queryRunner.query(`ALTER TABLE "medicos" DROP CONSTRAINT "FK_b348ac93bc12e810de99ecc6594"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_0d25ecbf9e1d6ac6b925d6c8e10"`);
        await queryRunner.query(`DROP TABLE "empleados"`);
        await queryRunner.query(`DROP TABLE "medicos"`);
        await queryRunner.query(`DROP TABLE "especialidades"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_role_enum"`);
        await queryRunner.query(`DROP TABLE "centros"`);
    }

}
