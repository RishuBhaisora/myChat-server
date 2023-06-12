import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import UserFriendChat from "./UserFriendChat";

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public senderId: number;

  @column()
  public content: string;

  @column({ columnName: "is_encrypted" })
  public isEncrypted: boolean;

  @column({ columnName: "is_seen" })
  public isSeen: boolean;

  @belongsTo(() => UserFriendChat, { foreignKey: 'userFriendChatId' })
  public chat: BelongsTo<typeof UserFriendChat>;

  @column()
  public userFriendChatId: number;

  public static table = 'messages';
}
