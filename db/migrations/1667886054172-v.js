module.exports = class v1667886054172 {
  name = 'v1667886054172'

  async up(db) {
    await db.query(`CREATE TABLE "collator" ("id" character varying NOT NULL, "bond" numeric, "apr24h" numeric, CONSTRAINT "PK_2c92edad8b66a47d923ff5abe31" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "delegator" ("id" character varying NOT NULL, CONSTRAINT "PK_a8359cef2656d4ecf83c3c20aa5" PRIMARY KEY ("id"))`)
    await db.query(`ALTER TABLE "round_collator" DROP COLUMN "self_bond"`)
    await db.query(`ALTER TABLE "round_collator" DROP COLUMN "commission"`)
    await db.query(`ALTER TABLE "round_collator" ADD "own_bond" numeric`)
    await db.query(`ALTER TABLE "round_collator" ADD "reward_amount" numeric`)
    await db.query(`ALTER TABLE "round_collator" ADD "collator_id" character varying`)
    await db.query(`ALTER TABLE "history_element" ADD "delegator_id" character varying`)
    await db.query(`ALTER TABLE "history_element" ADD "collator_id" character varying`)
    await db.query(`CREATE INDEX "IDX_9802aafb81c1ece7c4976e0180" ON "round_collator" ("collator_id") `)
    await db.query(`CREATE INDEX "IDX_484227de657c4097c91cf5474d" ON "history_element" ("delegator_id") `)
    await db.query(`CREATE INDEX "IDX_b5498fcc1d93521fc152e30170" ON "history_element" ("collator_id") `)
    await db.query(`ALTER TABLE "round_collator" ADD CONSTRAINT "FK_9802aafb81c1ece7c4976e01800" FOREIGN KEY ("collator_id") REFERENCES "collator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "history_element" ADD CONSTRAINT "FK_484227de657c4097c91cf5474db" FOREIGN KEY ("delegator_id") REFERENCES "delegator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "history_element" ADD CONSTRAINT "FK_b5498fcc1d93521fc152e301702" FOREIGN KEY ("collator_id") REFERENCES "collator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "collator"`)
    await db.query(`DROP TABLE "delegator"`)
    await db.query(`ALTER TABLE "round_collator" ADD "self_bond" numeric NOT NULL`)
    await db.query(`ALTER TABLE "round_collator" ADD "commission" numeric NOT NULL`)
    await db.query(`ALTER TABLE "round_collator" DROP COLUMN "own_bond"`)
    await db.query(`ALTER TABLE "round_collator" DROP COLUMN "reward_amount"`)
    await db.query(`ALTER TABLE "round_collator" DROP COLUMN "collator_id"`)
    await db.query(`ALTER TABLE "history_element" DROP COLUMN "delegator_id"`)
    await db.query(`ALTER TABLE "history_element" DROP COLUMN "collator_id"`)
    await db.query(`DROP INDEX "public"."IDX_9802aafb81c1ece7c4976e0180"`)
    await db.query(`DROP INDEX "public"."IDX_484227de657c4097c91cf5474d"`)
    await db.query(`DROP INDEX "public"."IDX_b5498fcc1d93521fc152e30170"`)
    await db.query(`ALTER TABLE "round_collator" DROP CONSTRAINT "FK_9802aafb81c1ece7c4976e01800"`)
    await db.query(`ALTER TABLE "history_element" DROP CONSTRAINT "FK_484227de657c4097c91cf5474db"`)
    await db.query(`ALTER TABLE "history_element" DROP CONSTRAINT "FK_b5498fcc1d93521fc152e301702"`)
  }
}
