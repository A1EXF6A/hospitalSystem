import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDB1764434839373 implements MigrationInterface {
    name = 'CreateDB1764434839373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "consultas" ("id" SERIAL NOT NULL, "paciente" character varying NOT NULL, "doctorId" integer NOT NULL, "centroId" integer NOT NULL, "fecha" TIMESTAMP NOT NULL, "notas" character varying, "estado" character varying NOT NULL DEFAULT 'programada', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_889a9011f1854a60a6aae1c6d80" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "consultas"`);
    }

}
