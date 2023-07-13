import { DateTime } from "luxon";
import { BaseModel, BelongsTo,  belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class UserFriendChat extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @belongsTo(() => User, {
    localKey: "user_id",
  })
  public user: BelongsTo<typeof User>;

  @column()
  public user_id: number;

  @column()
  public friend_id: number;
  
  @belongsTo(() => User, {
    localKey: "friend_id",
  })
  public friend: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public static table = 'chats';

}
