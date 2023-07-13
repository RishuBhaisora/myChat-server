import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'chats'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("user_id").unsigned().notNullable();
      table.integer("friend_id").unsigned().notNullable();
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("cascade");
      table
        .foreign("friend_id")
        .references("id")
        .inTable("users")
        .onDelete("cascade");
      table.unique(["user_id", "friend_id"]);
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
