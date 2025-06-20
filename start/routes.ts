/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Encryption from "@ioc:Adonis/Core/Encryption";
import Route from "@ioc:Adonis/Core/Route";
import Message from "App/Models/ChatMessage";
import User from "App/Models/User";
import { DateTime } from "luxon";
const jwt = require("jsonwebtoken");
import { schema, rules } from "@ioc:Adonis/Core/Validator";

Route.post("/register", "UsersController.create");
Route.post("/login", "UsersController.login");
Route.post(
  "/requestPasswordResetOtp",
  "UsersController.requestPasswordResetOtp"
);
Route.post("/sendFriendRequest", "FriendshipsController.sendFriendRequest");
Route.post("/acceptFriendRequest", "FriendshipsController.acceptFriendRequest");
Route.post("/rejectFriendRequest", "FriendshipsController.rejectFriendRequest");
Route.post("/cancelFriendRequest", "FriendshipsController.cancelFriendRequest");
Route.post("/removeFriend", "FriendshipsController.removeFriend");

Route.post("/resetPassword", async ({ response, request }) => {
  const { email, otp } = request.all();

  const user = await User.findBy("email", email);
  if (user) {
    // Verify the OTP
    const user = await User.findBy("email", email);
    if (!user || user.verification_token !== otp) {
      return response.status(400).json({ message: "Invalid OTP" });
    }
    const passwordValidationSchema = schema.create({
      newPassword: schema.string({}, [rules.minLength(8)]),
    });
    const validatedData = await request.validate({
      schema: passwordValidationSchema,
    });

    user.password = validatedData.newPassword;
    user.verification_token = null;
    await user.save();

    return response.status(200).json({ message: "Password reset successful" });
  }
});

Route.get("/verify/:email", async ({ params, response, request }) => {
  const user = await User.findBy("email", params.email);
  if (request.hasValidSignature()) {
    if (user) {
      user.verified_email = true;
      user.verification_token = null;
      await user.save();
      return response.send("Congratulations verified successfully, Try login");
    }
  }
  await user?.delete();
  return response.status(404).send("Signature is missing or URL was tampered.");
});

Route.post("/suggestedFriends", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const users = await User.all();
    const userFriends = await user
      .related("friends")
      .pivotQuery()
      .where("status", "accepted");

    const prevRequests = await user
      .related("friendRequests")
      .pivotQuery()
      .where("status", "pending");

    const sentFriendRequests = await user
      .related("friendRequestsSent")
      .pivotQuery()
      .where("status", "pending");

    const filteredUsers = users.filter(
      (u) =>
        u.email !== decoded.email &&
        !userFriends.some((f) => u.id === f.friend_id) &&
        !prevRequests.some((f) => f.user_id === u.id) &&
        !sentFriendRequests.some((f) => f.friend_id === u.id)
    );

    return response.status(200).send(filteredUsers);
  } catch (e) {
    return response.status(404).json({ message: "Something went wrong." });
  }
});

Route.post("/friends", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const userFriends = await user
      .related("friends")
      .pivotQuery()
      .where("status", "accepted");

    const modifiedRequests: any[] = [];

    for (let i = 0; i < userFriends.length; i++) {
      const data = userFriends[i];
      const friend_details = await User.findByOrFail("id", data.friend_id);
      modifiedRequests.push({
        ...data,
        friend_details,
      });
    }
    return response.status(200).send(modifiedRequests);
  } catch (e) {
    return response.status(404).json({ message: "Something went wrong." });
  }
});

Route.post("/friendRequestsSent", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const sentRequests = await user
      .related("friendRequestsSent")
      .pivotQuery()
      .where("status", "pending");
    const modifiedRequests: any[] = [];

    for (let i = 0; i < sentRequests.length; i++) {
      const data = sentRequests[i];
      const friend_details = await User.findByOrFail("id", data.friend_id);
      modifiedRequests.push({
        ...data,
        friend_details,
      });
    }
    return response.status(200).send(modifiedRequests);
  } catch (e) {
    return response.status(404).json({ message: "Something went wrong." });
  }
});

Route.post("/friendRequests", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const friendRequests = await user
      .related("friendRequests")
      .pivotQuery()
      .where("status", "pending");
    const modifiedRequests: any[] = [];

    for (let i = 0; i < friendRequests.length; i++) {
      const data = friendRequests[i];
      const friend_details = await User.findByOrFail("id", data.user_id);
      modifiedRequests.push({
        ...data,
        user_id: data.friend_id,
        friend_id: data.user_id,
        friend_details,
      });
    }
    return response.status(200).send(modifiedRequests);
  } catch (e) {
    return response.status(404).json({ message: "Something went wrong." });
  }
});

Route.post("/userFriendMessages", async ({ request, response }) => {
  try {
    const { token, friend_id } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const friend = await User.findByOrFail("id", friend_id);

    const userFriend = await user
      .related("friends")
      .pivotQuery()
      .where("status", "accepted")
      .where("friend_id", friend.id)
      .first();

    if (userFriend) {
      const chat = await user
        .related("chats")
        .pivotQuery()
        .where("friend_id", friend.id)
        .first();

      if (!chat) {
        await user.related("chats").attach({
          [friend.id]: {
            created_at: DateTime.now(),
            updated_at: DateTime.now(),
          },
        });
        await friend.related("chats").attach({
          [user.id]: {
            created_at: DateTime.now(),
            updated_at: DateTime.now(),
          },
        });
      }

      const userChat = await user
        .related("chats")
        .pivotQuery()
        .where("friend_id", friend_id)
        .firstOrFail();

      const friendChat = await friend
        .related("chats")
        .pivotQuery()
        .where("friend_id", user.id)
        .firstOrFail();

      const messages = await Message.query()
        .orderBy("created_at", "asc")
        .where("userFriendChatId", userChat.id);

      const friendMessages = await Message.query()
        .orderBy("created_at", "asc")
        .where("userFriendChatId", friendChat.id);

      friendMessages.map((m) => {
        if (m.senderId === friend_id) {
          m.isSeen = true;
        }
        m.save();
      });
      messages.map((m) => {
        if (m.senderId === friend_id) {
          m.isSeen = true;
        }
        m.save();
      });
      const friend_details = await User.findByOrFail("id", friend_id);

      return response.status(200).send({
        chat: {
          ...userChat,
          friend_details,
          messages: messages.map((m) => {
            const decryptedMessage = { ...m.$attributes };
            if (decryptedMessage.isEncrypted) {
              decryptedMessage.isEncrypted = false;
              decryptedMessage.content = Encryption.decrypt(
                m.content
              ) as string;
            }
            return decryptedMessage;
          }),
        },
      });
    } else {
      throw "Not a friend to chat.";
    }
  } catch (e) {
    return response.status(404).json({ message: e ?? "Something went wrong." });
  }
});

Route.post("/recentChats", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);

    const userChats = await user
      .related("chats")
      .pivotQuery()
      .where("user_id", user.id);

    // Fetch the last message for each chat
    const chatsWithLastMessage = await Promise.all(
      userChats.map(async (chat) => {
        const lastMessage = await Message.query()
          .orderBy("created_at", "desc")
          .where("userFriendChatId", chat.id)
          .first();
        const messages = await Message.query()
          .orderBy("created_at", "asc")
          .where("userFriendChatId", chat.id);
        const friend = await User.findByOrFail("id", chat.friend_id);
        const friendChat = await friend
          .related("chats")
          .pivotQuery()
          .where("friend_id", user.id)
          .firstOrFail();

        const friendMessages = await Message.query()
          .orderBy("created_at", "asc")
          .where("userFriendChatId", friendChat.id);

        friendMessages.map((m) => {
          if (m.senderId === friend.id) {
            m.isSeen = true;
          }
          m.save();
        });
        messages.map((m) => {
          if (m.senderId === friend.id) {
            m.isSeen = true;
          }
          m.save();
        });
        const friend_details = await User.findByOrFail("id", chat.friend_id);
        return {
          chat: {
            ...chat,
            friend_details,
            messages: messages.map((m) => {
              const decryptedMessage = { ...m.$attributes };
              if (decryptedMessage.isEncrypted) {
                decryptedMessage.isEncrypted = false;
                decryptedMessage.content = Encryption.decrypt(
                  m.content
                ) as string;
              }
              return decryptedMessage;
            }),
          },
          lastMessage,
        };
      })
    );

    // Sort the chats based on the last message's created_at timestamp
    const sortedChats = chatsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1; // Place chats without messages at the end
      if (!b.lastMessage) return -1; // Place chats without messages at the end

      return b.lastMessage.id - a.lastMessage.id;
    });

    return response.status(200).send({
      recentChats: sortedChats.map((item) => item.chat),
    });
  } catch (e) {
    return response.status(404).json({ message: e });
  }
});

Route.post("/getNotifications", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    const notifications = await user.related("notifications").query();

    return response.status(200).send({ notifications });
  } catch (e) {
    return response.status(404).json({ message: e });
  }
});

Route.post("/readAllNotifications", async ({ request, response }) => {
  try {
    const { token } = request.all();
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);

    const notifications = await user.related("notifications").query();

    for (const notification of notifications) {
      if (!notification.seen) {
        notification.seen = true;
        await notification.save();
      }
    }

    const updatedNotifications = await user.related("notifications").query();
    return response.status(200).send({
      notifications: updatedNotifications,
    });
  } catch (e) {
    return response.status(404).json({ message: e });
  }
});
