'use server'

import { nanoid }from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

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
      defaultAccesses: []
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

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    if (!hasAccess) throw new Error('No Access');

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
    return rooms;
  } catch(error) {
    console.error(`Error while getting a rooms for user: ${error}`)
  }
}

export async function updateDocumentAccess({ roomId, email, userType, updatedBy }: ShareDocumentParams) {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType),
    }

    const room = await liveblocks.updateRoom(roomId, { usersAccesses });
    if (room) {
      console.log(updatedBy.userType);
    }

    revalidatePath(`/documents/${roomId}`);
    return room;
  } catch (error) {
    console.error(error);
  }
}

export async function removeCollaborator(roomId: string, email: string) {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (room.metadata.email === email) {
      throw new Error('You cannot remove yourself as the owner');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
    })
    
    revalidatePath(`/documents/${roomId}`);
    return updatedRoom;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteDocument(roomId: string) {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.error(error);
  }
}