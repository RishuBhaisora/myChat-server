import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyMessagesTableSchema extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('content');
      table.renameColumn('chat_id', 'user_friend_chat_id');
      table.foreign('user_friend_chat_id').references('id').inTable('chats').onDelete('cascade');
      table.text('encrypted_content').nullable();
      table.text('message-content').nullable();
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.renameColumn('user_friend_chat_id', 'chat_id');
      table.dropForeign('messages_user_friend_chat_id_foreign');
      table.dropColumn('message-content');
      table.dropColumn('encrypted_content');
    });
  }
}