'use server'

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export async function getClerkUsers(userIds: string[]) {
  try {
    const { data } = await (await clerkClient()).users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));

    const sortedUsers = userIds.map(email => users.find(user => user.email === email));
    return parseStringify(sortedUsers);
  } catch (error) {
    console.error(error);
  }
}

export async function getDocumentUsers(roomId: string, currentUser: string, text: string) {
  try {
    const room = await liveblocks.getRoom(roomId);
    const users = Object.keys(room.usersAccesses).filter(email => email !== currentUser);

    if (text.length) {
      const lowercaseText = text.toLowerCase();
      const filteredUsers = users.filter(email => email.toLowerCase().includes(lowercaseText));
      return filteredUsers;
    }

    return users;
  } catch (error) {
    console.error(`Error fetching document users: ${error}`);
  }
}