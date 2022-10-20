module.exports = class ff1666276592924 {
  name = 'ff1666276592924'

  async up(db) {
    await db.query(`ALTER TABLE "staker" ADD "role" text`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "staker" DROP COLUMN "role"`)
  }
}
