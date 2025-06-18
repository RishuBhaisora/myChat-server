import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  manyToMany,
  ManyToMany,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import UserFriendChat from "./UserFriendChat";
import Notification from "./Notification";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public verification_token: string | null;

  @column({ serializeAs: null })
  public verified_email: boolean;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @manyToMany(() => User, {
    pivotTable: "friendships",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "friend_id",
  })
  public friends: ManyToMany<typeof User>;

  @manyToMany(() => User, {
    pivotTable: "friendships",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "friend_id",
    pivotRelatedForeignKey: "user_id",
    pivotColumns: ["status"],
  })
  public friendRequests: ManyToMany<typeof User>;

  @manyToMany(() => User, {
    pivotTable: "friendships",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "friend_id",
    pivotColumns: ["status"],
  })
  public friendRequestsSent: ManyToMany<typeof User>;

  @manyToMany(() => UserFriendChat, {
    pivotTable: "chats",
    localKey: "id",
    relatedKey: "id",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "friend_id",
    pivotColumns: ["messages"],
  })
  public chats: ManyToMany<typeof UserFriendChat>;

  @hasMany(() => Notification)
  public notifications: HasMany<typeof Notification>;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}
