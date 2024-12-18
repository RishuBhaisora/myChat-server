import Ws from "App/Services/Ws";
const jwt = require("jsonwebtoken");
import User from "App/Models/User";
import Encryption from "@ioc:Adonis/Core/Encryption";
import Message from "App/Models/ChatMessage";

Ws.boot();

const userSockets = new Map();
/**
 * Listen for incoming socket connections
 */

Ws.io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, "mySuperSecretKey");
    const user = await User.findByOrFail("email", decoded.email);
    userSockets.set(user.id, socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      userSockets.delete(user.id);
    });
  } catch (err) {
    socket.emit("error", {
      message: "Invalid or missing token. Connection rejected.",
    });
    socket.disconnect();
  }

  socket.on("message", async (data) => {
    try {
      const { friend_id, message } = data;
      const decoded = jwt.verify(token, "mySuperSecretKey");
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findByOrFail("id", friend_id);

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
      const encryptedMessage = Encryption.encrypt(message);
      const userMessage = new Message();
      userMessage.fill({
        senderId: user.id,
        userFriendChatId: userChat.id,
        content: encryptedMessage,
      });
      const friendMessage = new Message();
      friendMessage.fill({
        senderId: user.id,
        userFriendChatId: friendChat.id,
        content: encryptedMessage,
      });
      await userMessage.save();
      await friendMessage.save();

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

      const payload = {
        messages: messages.map((m) => {
          const decryptedMessage = { ...m.$attributes };
          if (decryptedMessage.isEncrypted) {
            decryptedMessage.isEncrypted = false;
            decryptedMessage.content = Encryption.decrypt(m.content) as string;
          }
          return decryptedMessage;
        }),
      };

      socket.send({
        chat: {
          ...userChat,
          ...payload,
          friend_details: friend,
        },
      });
      if (userSockets.has(friend_id)) {
        const targetSocketId = userSockets.get(friend_id);
        if (targetSocketId) {
          socket.to(targetSocketId).emit("message", {
            chat: {
              ...friendChat,
              ...payload,
              friend_details: user,
            },
          });
        }
      }
    } catch (error) {
      socket.emit("error", {
        message: "Something went wrong",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
