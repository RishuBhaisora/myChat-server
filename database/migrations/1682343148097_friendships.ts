import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "friendships";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable();
      table.integer("friend_id").unsigned().notNullable();
      table
        .enu("status", ["pending", "accepted", "rejected"])
        .defaultTo("pending");
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
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true }).notNullable;
      table.timestamp("updated_at", { useTz: true }).notNullable;
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
