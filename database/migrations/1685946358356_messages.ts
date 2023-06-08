import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('chat_id').unsigned().notNullable();
      table.integer('sender_id').unsigned().notNullable();
      table.text('content').notNullable();
      table.boolean('is_encrypted').defaultTo(true);
      table.boolean('is_seen').defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.foreign('chat_id').references('id').inTable('chats').onDelete('cascade');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
