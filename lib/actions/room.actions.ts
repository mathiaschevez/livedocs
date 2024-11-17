'use server'

import { nanoid }from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { parseStringify } from '../utils';

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: 'Untitled'
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write']
    }

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: ['room:write']
    });

    revalidatePath('/');

    return parseStringify(room);
  } catch (error) {
    console.error(`Error while creating a live room: ${error}`)
  }
}

export async function getDocument(roomId: string, userId: string) {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (!userId) console.log('no user');
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    // if (!hasAccess) throw new Error('No Access')
    // else 
    return parseStringify(room);
  } catch(error) {
    console.error(`Error while getting a room: ${error}`)
  }
}

export async function updateDocument(roomId:string, title: string) {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: { title }
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.error(error)
  }
}

export async function getDocuments(userEmail: string) {
  try {
    const rooms = await liveblocks.getRooms({ userId: userEmail });
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    // if (!hasAccess) throw new Error('No Access')
    // else 
    return rooms;
  } catch(error) {
    console.error(`Error while getting a rooms for user: ${error}`)
  }
}