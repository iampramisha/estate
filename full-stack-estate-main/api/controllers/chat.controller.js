import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  // Yes, that's correct. The `userIDs` field in your `chat` table is an array that stores the IDs of users participating in that chat. By using the `hasSome` operator with `tokenUserId`, you're querying for all chats where the authenticated user's ID is one of the participants in that `userIDs` array. This way, you can retrieve all the chats that involve the user identified by `tokenUserId`.
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      //The receiver’s details are added to the chat object under the receiver key.
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  // try {
  //   const chat = await prisma.chat.findUnique({
  //     where: {
  //       id: req.params.id,
  //       userIDs: {
  //         hasSome: [tokenUserId],
  //       },
  //     },
  //     include: {
  //       messages: {
  //         orderBy: {
  //           createdAt: "asc",
  //         },
  //       },
  //     },
  //   });

  //   await prisma.chat.update({
  //     where: {
  //       id: req.params.id,
  //     },
  //     data: {
  //       seenBy: {
  //         push: [tokenUserId],
  //       },
  //     },
  //   });
  //   res.status(200).json(chat);
  try{
const chat=await prisma.chat.findUnique({
  where:{
    id:req.params.id,
    userIDs:{
      hasSome:[tokenUserId],
    }
  },
  //include: The include option fetches related messages 
  //and orders them by the createdAt field in ascending order
  include:{
    messages:{
      orderBy:{
        createdAt:"asc"
      }
    }
  }
});
await prisma.chat.update({
  where:{
    id:req.params.id
  },
  data:{
    seenBy:{
      set:[tokenUserId]
    }
  }
})
res.status(200).json(chat);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, req.body.receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};
