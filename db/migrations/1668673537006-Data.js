module.exports = class Data1668673537006 {
  name = 'Data1668673537006'

  async up(db) {
    await db.query(`CREATE TABLE "staker" ("id" character varying NOT NULL, "native_address" text NOT NULL, "evm_address" text, "balance" numeric NOT NULL, CONSTRAINT "PK_13561f691b22038cfa606fe1161" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "contract" ("id" character varying NOT NULL, "name" text, "total_staked" numeric NOT NULL, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "transaction" ("id" character varying NOT NULL, "action" text NOT NULL, "timestamp" numeric NOT NULL, "block" integer NOT NULL, "transaction_hash" text NOT NULL, "amount" numeric NOT NULL, "user_id" character varying, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_b4a3d92d5dde30f3ab5c34c586" ON "transaction" ("user_id") `)
    await db.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862" FOREIGN KEY ("user_id") REFERENCES "staker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "staker"`)
    await db.query(`DROP TABLE "contract"`)
    await db.query(`DROP TABLE "transaction"`)
    await db.query(`DROP INDEX "public"."IDX_b4a3d92d5dde30f3ab5c34c586"`)
    await db.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862"`)
  }
}
