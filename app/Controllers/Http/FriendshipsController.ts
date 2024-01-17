import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { DateTime } from "luxon";
const jwt = require("jsonwebtoken");

const secret = "mySuperSecretKey";
export default class FriendshipsController {
  public async sendFriendRequest({ request, response }: HttpContextContract) {
    try {
      const { friend_id, token } = request.all();
      if (!friend_id) {
        throw "friend_id required.";
      }
      const decoded = jwt.verify(token, secret);
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findOrFail(friend_id);
      if (user.id !== friend.id) {
        const prevRequests = await user
          .related("friendRequests")
          .pivotQuery()
          .where("status", "pending");

        const prevFriends = await user
          .related("friends")
          .pivotQuery()
          .where("status", "accepted");

        const sentFriendRequests = await user
          .related("friendRequestsSent")
          .pivotQuery()
          .where("status", "pending");

        if (
          sentFriendRequests.findIndex((f) => f.friend_id === friend.id) ===
            -1 &&
          prevFriends.findIndex((f) => f.friend_id === friend.id) === -1 &&
          prevRequests.findIndex((f) => f.user_id === friend.id) === -1
        ) {
          await user.related("friendRequestsSent").attach({
            [friend.id]: {
              created_at: DateTime.now(),
              updated_at: DateTime.now(),
            },
          });
          const sentFriendRequests = await user
            .related("friendRequestsSent")
            .pivotQuery()
            .where("status", "pending");
          const modifiedRequests: any[] = [];

          for (let i = 0; i < sentFriendRequests.length; i++) {
            const data = sentFriendRequests[i];
            const friend_details = await User.findByOrFail(
              "id",
              data.friend_id
            );
            modifiedRequests.push({
              ...data,
              friend_details,
            });
          }

          return response.status(200).json({
            success: true,
            message: "Friend request sent.",
            sentFriendRequests: modifiedRequests,
          });
        }
        throw "Friend request is already sent or pending form this user or already friend.";
      }
      throw "Invalid friend_id";
    } catch (error) {
      return response
        .status(404)
        .json({ message: error ?? "Something went wrong." });
    }
  }

  public async acceptFriendRequest({ request, response }: HttpContextContract) {
    try {
      const { friend_id, token } = request.all();
      if (!friend_id) {
        throw "friend_id required.";
      }
      const decoded = jwt.verify(token, secret);
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findOrFail(friend_id);
      if (user.id !== friend.id) {
        const prevRequests = await user
          .related("friendRequests")
          .pivotQuery()
          .where("status", "pending");

        const prevFriends = await user
          .related("friends")
          .pivotQuery()
          .where("status", "accepted");
        if (
          prevRequests.findIndex((r) => r.user_id === friend.id) >= 0 &&
          prevFriends.findIndex((f) => f.friend_id === friend.id) === -1
        ) {
          await user.related("friendRequests").detach([friend.id]);
          await user.related("friends").attach({
            [friend.id]: {
              status: "accepted",
              created_at: DateTime.now(),
              updated_at: DateTime.now(),
            },
          });
          await friend.related("friends").attach({
            [user.id]: {
              status: "accepted",
              created_at: DateTime.now(),
              updated_at: DateTime.now(),
            },
          });

          const friends = await user
            .related("friends")
            .pivotQuery()
            .where("status", "accepted");

          const pendingRequests = await user
            .related("friendRequests")
            .pivotQuery()
            .where("status", "pending");

          const modifiedPendingRequests: any[] = [];
          const modifiedFriends: any[] = [];

          for (let i = 0; i < pendingRequests.length; i++) {
            const data = pendingRequests[i];
            const friend_details = await User.findByOrFail("id", data.user_id);
            modifiedPendingRequests.push({
              ...data,
              user_id: data.friend_id,
              friend_id: data.user_id,
              friend_details,
            });
          }
          for (let i = 0; i < friends.length; i++) {
            const data = friends[i];
            const friend_details = await User.findByOrFail(
              "id",
              data.friend_id
            );
            modifiedFriends.push({
              ...data,
              friend_details,
            });
          }

          return response.status(200).json({
            success: true,
            message: "Accepted successfully.",
            pendingRequests: modifiedPendingRequests,
            friends: modifiedFriends,
          });
        }
        throw "No friend request from user or already friend.";
      }
      throw "Invalid friend_id.";
    } catch (error) {
      return response
        .status(404)
        .json({ message: error ?? "Something went wrong." });
    }
  }

  public async rejectFriendRequest({ request, response }: HttpContextContract) {
    try {
      const { friend_id, token } = request.all();
      if (!friend_id) {
        throw "friend_id required.";
      }
      const decoded = jwt.verify(token, secret);
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findOrFail(friend_id);
      if (user.id !== friend.id) {
        const prevRequests = await user
          .related("friendRequests")
          .pivotQuery()
          .where("status", "pending");

        const prevFriends = await user
          .related("friends")
          .pivotQuery()
          .where("status", "accepted");
        if (
          prevRequests.findIndex((r) => r.user_id === friend.id) >= 0 &&
          prevFriends.findIndex((f) => f.friend_id === friend.id) === -1
        ) {
          await user.related("friendRequests").detach([friend.id]);
          const pendingRequests = await user
            .related("friendRequests")
            .pivotQuery()
            .where("status", "pending");
          const modifiedPendingRequests: any[] = [];

          for (let i = 0; i < pendingRequests.length; i++) {
            const data = pendingRequests[i];
            const friend_details = await User.findByOrFail("id", data.user_id);
            modifiedPendingRequests.push({
              ...data,
              user_id: data.friend_id,
              friend_id: data.user_id,
              friend_details,
            });
          }

          return response.status(200).json({
            success: true,
            message: "Rejected successfully.",
            pendingRequests: modifiedPendingRequests,
          });
        }
        throw "No friend request from user or already friend.";
      }
      throw "Invalid friend_id.";
    } catch (error) {
      return response
        .status(404)
        .json({ message: error ?? "Something went wrong." });
    }
  }

  public async cancelFriendRequest({ request, response }: HttpContextContract) {
    try {
      const { friend_id, token } = request.all();
      if (!friend_id) {
        throw "friend_id required.";
      }
      const decoded = jwt.verify(token, secret);
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findOrFail(friend_id);
      if (user.id !== friend.id) {
        const prevFriends = await user
          .related("friends")
          .pivotQuery()
          .where("status", "accepted");

        const sentFriendRequests = await user
          .related("friendRequestsSent")
          .pivotQuery()
          .where("status", "pending");

        if (
          sentFriendRequests.some((f) => f.friend_id === friend.id) &&
          prevFriends.findIndex((f) => f.friend_id === friend.id) === -1
        ) {
          await user.related("friendRequestsSent").detach([friend.id]);
          const sentFriendRequests = await user
            .related("friendRequestsSent")
            .pivotQuery()
            .where("status", "pending");

          const modifiedRequests: any[] = [];

          for (let i = 0; i < sentFriendRequests.length; i++) {
            const data = sentFriendRequests[i];
            const friend_details = await User.findByOrFail(
              "id",
              data.friend_id
            );
            modifiedRequests.push({
              ...data,
              friend_details,
            });
          }

          return response.status(200).json({
            success: true,
            message: "Friend request cancelled.",
            sentFriendRequests: modifiedRequests,
          });
        }
        throw "No sent requests from user or already friend.";
      }
      throw "Invalid friend_id";
    } catch (error) {
      return response
        .status(404)
        .json({ message: error ?? "Something went wrong." });
    }
  }

  public async removeFriend({ request, response }: HttpContextContract) {
    try {
      const { friend_id, token } = request.all();
      if (!friend_id) {
        throw "friend_id required.";
      }
      const decoded = jwt.verify(token, secret);
      const user = await User.findByOrFail("email", decoded.email);
      const friend = await User.findOrFail(friend_id);
      if (user.id !== friend.id) {
        const prevFriends = await user
          .related("friends")
          .pivotQuery()
          .where("status", "accepted");
        if (prevFriends.findIndex((f) => f.friend_id === friend.id) >= 0) {
          await user.related("friends").detach([friend.id]);
          await friend.related("friends").detach([user.id]);
          const friends = await user
            .related("friends")
            .pivotQuery()
            .where("status", "accepted");
          const modifiedFriends: any[] = [];

          for (let i = 0; i < friends.length; i++) {
            const data = friends[i];
            const friend_details = await User.findByOrFail(
              "id",
              data.friend_id
            );
            modifiedFriends.push({
              ...data,
              friend_details,
            });
          }
          return response.status(200).json({
            success: true,
            message: "Friend removed successfully.",
            friends: modifiedFriends,
          });
        }
        throw "User is not in your friends.";
      }
      throw "Invalid friend_id.";
    } catch (error) {
      return response
        .status(404)
        .json({ message: error ?? "Something went wrong." });
    }
  }
}
