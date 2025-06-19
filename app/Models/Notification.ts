import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import { DateTime } from "luxon";

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @column()
  public message: string;

  @column()
  public seen: boolean;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;
}
