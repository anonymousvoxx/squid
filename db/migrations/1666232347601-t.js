module.exports = class t1666232347601 {
  name = 't1666232347601'

  async up(db) {
    await db.query(`ALTER TABLE "round_nomination" RENAME COLUMN "vote" TO "amount"`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "round_nomination" RENAME COLUMN "amount" TO "vote"`)
  }
}
