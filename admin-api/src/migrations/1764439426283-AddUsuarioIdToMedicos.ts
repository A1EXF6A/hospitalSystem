import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsuarioIdToMedicos1764439426283 implements MigrationInterface {
    name = 'AddUsuarioIdToMedicos1764439426283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medicos" ADD "usuarioId" integer`);
        await queryRunner.query(`ALTER TABLE "medicos" ADD CONSTRAINT "FK_88564cd3f01cf35d5480fa14f39" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medicos" DROP CONSTRAINT "FK_88564cd3f01cf35d5480fa14f39"`);
        await queryRunner.query(`ALTER TABLE "medicos" DROP COLUMN "usuarioId"`);
    }

}
