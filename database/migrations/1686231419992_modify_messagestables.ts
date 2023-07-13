import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ModifyMessagesTableSchema extends BaseSchema {
  protected tableName = "messages";

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn("message-content");
      table.text("content").nullable();
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn("content");
    });
  }
}
