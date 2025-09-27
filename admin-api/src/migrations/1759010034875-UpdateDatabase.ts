import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDatabase1759010034875 implements MigrationInterface {
    name = 'UpdateDatabase1759010034875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuarios_role_enum" AS ENUM('admin', 'medico', 'empleado')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."usuarios_role_enum" NOT NULL DEFAULT 'empleado', "centroId" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_0d25ecbf9e1d6ac6b925d6c8e10" FOREIGN KEY ("centroId") REFERENCES "centros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_0d25ecbf9e1d6ac6b925d6c8e10"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_role_enum"`);
    }

}
