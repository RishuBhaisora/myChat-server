import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
      this.schema.table(this.tableName, (table) => {
        table.boolean('verified_email').defaultTo(false)
        table.string('verification_token').nullable().unique()
      })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('verified_email')
      table.dropColumn('verification_token')  
    })
  }
}
