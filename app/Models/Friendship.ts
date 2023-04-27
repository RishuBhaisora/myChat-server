import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class Friendship extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @column()
  public user_id: number;

  @column()
  public friend_id: number;

  @column()
  public status: "pending" | "accepted" | "rejected";

  @belongsTo(() => User, {
    localKey: "user_id",
  })
  public user: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    localKey: "friend_id",
  })
  public friend: BelongsTo<typeof User>;
}
