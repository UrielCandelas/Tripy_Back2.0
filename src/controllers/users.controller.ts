import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getOneUser, getLocation, getExtras } from "../lib/travels.lib";
import { Contact } from "../../types";

const prisma = new PrismaClient();
const User = prisma.users;
const Travel = prisma.travels;
const RequestTravel = prisma.travel_Request;
const Commentary = prisma.user_Comments;
const Chat = prisma.chat_Messages;
const img_Users = prisma.img_Users;
const img_Locations = prisma.img_Locations;
const Expenses = prisma.det_Expenses;

export const getUsersByRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const requests = await RequestTravel.findMany({ where: { id_user1: id } });
    const userid = [];
    const usersFoundArr = [];
    for (let index = 0; index < requests.length; index++) {
      userid.push(requests[index].id_user2);
      if (userid[index]) {
        const userFound = await User.findUnique({
          where: { id: userid[index] },
        });
        usersFoundArr.push(userFound);
      }
    }
    res.status(200).json(usersFoundArr);
  } catch (error) {
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const registerNewCommentary = async (req: Request, res: Response) => {
  const { commentary_text, id_userComented, id_userComent, rate } = req.body;
  try {
    await Commentary.create({
      data: {
        comentary_text: commentary_text,
        id_userComented,
        id_userComent,
        rate,
      },
    });
    res.status(200).json(["Comentario guardado"]);
  } catch (error) {
    console.log(error);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getComentariesByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const arrUsers = [];
  const arrCommentaries = [];
  try {
    const commentariesFound = await Commentary.findMany({
      where: { id_userComented: id },
    });
    if (commentariesFound.length > 0) {
      for (let index = 0; index < commentariesFound.length; index++) {
        arrCommentaries.push(commentariesFound[index]);
        const userFound = await getOneUser(
          arrCommentaries[index].id_userComent
        );
        arrUsers.push(userFound);
      }
      const data = {
        users: arrUsers,
        commentaries: arrCommentaries,
      };
      return res.status(200).json(data);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.log(error);
    return res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getContacts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contacts = [];
  try {
    const travelFoundU1 = await Travel.findMany({
      where: { id_user1: id },
    });
    const travelFoundU2 = await Travel.findMany({
      where: { id_user2: id },
    });
    for (let index = 0; index < travelFoundU1.length; index++) {
      if (travelFoundU1[index]) {
        const userFound = await getOneUser(
          travelFoundU1[index]?.id_user2
            ? (travelFoundU1[index]?.id_user2 as string)
            : ""
        );
        const image = await img_Users.findUnique({
          where: {
            id: userFound?.idProfile_img
              ? (userFound?.idProfile_img as string)
              : "",
          },
        });
        if (userFound) {
          const dataContactsU1 = {
            id: userFound.id,
            name: userFound.name,
            userName: userFound.userName,
            lastName: userFound.lastName,
            email: userFound.email,
            profileImg: image?.image,
          };
          contacts.push(dataContactsU1);
        }
      }
    }
    for (let index = 0; index < travelFoundU2.length; index++) {
      if (travelFoundU2[index]) {
        const userFound = await getOneUser(travelFoundU2[index].id_user1);
        const image = await img_Users.findUnique({
          where: {
            id: userFound?.idProfile_img as string,
          },
        });
        if (userFound) {
          const dataContactsU2 = {
            id: userFound.id,
            name: userFound.name,
            userName: userFound.userName,
            lastName: userFound.lastName,
            email: userFound.email,
            profileImg: image?.image,
          };
          contacts.push(dataContactsU2);
        }
      }
    }
    const uniqueContacts = contacts.reduce((unique, contact) => {
      const existingContact = unique.find(
        (item: Contact) => item.id === contact.id
      );
      if (!existingContact) {
        unique.push(contact as never);
      }
      return unique;
    }, []);
    res.status(200).json(uniqueContacts);
  } catch (error) {
    console.log(error);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { id_user1, id_user2 } = req.body;
  try {
    const messages = await Chat.findMany({
      where: {
        users: {
          array_contains: [id_user1, id_user2],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const PMessages = messages.map((message) => {
      return {
        fromSelf: message.id_user1 === id_user1,
        message: message.message,
      };
    });
    res.status(200).json(PMessages);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const registerNewMessage = async (req: Request, res: Response) => {
  const { id_user1, id_user2, message } = req.body;
  try {
    const messageSaved = await Chat.create({
      data: {
        id_user1,
        id_user2,
        users: [id_user1, id_user2],
        message,
      },
    });
    return res.status(200).json(messageSaved);
  } catch (error) {
    console.log(error);
    return res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getComentsAndTravelsInactive = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const cardU1 = [];
  const cardU2 = [];
  const reviews = [];
  try {
    const user = await getOneUser(id);
    const image = await img_Users.findUnique({
      where: {
        id: user?.idProfile_img as string,
      },
    });
    const commentariesFound = await Commentary.findMany({
      where: { id_userComented: id },
    });
    if (commentariesFound.length > 0) {
      for (let index = 0; index < commentariesFound.length; index++) {
        const userFound = await getOneUser(
          commentariesFound[index].id_userComent
        );
        const imgReviews = await img_Users.findUnique({
          where: {
            id: userFound?.idProfile_img as string,
          },
        });
        const data = {
          user: userFound,
          comentary: commentariesFound[index],
          imgReviews: imgReviews?.image,
        };
        reviews.push(data);
      }
    }
    const travelsFoundUser1 = await Travel.findMany({
      where: {
        id_user1: id,
        isActive: false,
      },
    });
    const travelsFoundUser2 = await Travel.findMany({
      where: {
        id_user2: id,
        isActive: false,
      },
    });
    if (!travelsFoundUser1 && !travelsFoundUser2) {
      return res.status(200).json(["No hay viajes"]);
    }

    for (let index = 0; index < travelsFoundUser1.length; index++) {
      if (travelsFoundUser1[index]) {
        const expensesFound = await Expenses.findMany({
          where: { id_user1: travelsFoundUser1[index].id_user1 },
        });
        let totalexpenses = 0;
        for (let index = 0; index < expensesFound.length; index++) {
          const data = expensesFound[index].quantity;
          totalexpenses += data.toNumber();
        }
        const locationFound = await getLocation(
          travelsFoundUser1[index].id_location
        );
        const image2Found = await img_Locations.findUnique({
          where: {
            id: locationFound?.id_locationImage2,
          },
        });
        const extrasFound = await getExtras(
          travelsFoundUser1[index].id_extras as string
        );
        const data = {
          travel: travelsFoundUser1[index],
          quantity: totalexpenses,
          expense: expensesFound[0].expense,
          location: locationFound,
          extras: extrasFound ? extrasFound : null,
          image: image2Found?.image,
        };
        cardU1.push(data);
      }
    }
    for (let index = 0; index < travelsFoundUser2.length; index++) {
      if (travelsFoundUser2[index]) {
        const expensesFound = await Expenses.findMany({
          where: { id_user1: travelsFoundUser2[index].id_user1 },
        });
        let totalexpenses = 0;
        for (let index = 0; index < expensesFound.length; index++) {
          const data = expensesFound[index].quantity;
          totalexpenses += data.toNumber();
        }
        const locationFound = await getLocation(
          travelsFoundUser2[index].id_location
        );
        const image2Found = await img_Locations.findUnique({
          where: {
            id: locationFound?.id_locationImage2,
          },
        });
        const extrasFound = await getExtras(
          travelsFoundUser2[index].id_extras as string
        );
        const data = {
          travel: travelsFoundUser2[index],
          quantity: totalexpenses,
          expense: expensesFound[0].expense,
          location: locationFound,
          extras: extrasFound ? extrasFound : null,
          image: image2Found?.image,
        };
        cardU2.push(data);
      }
    }

    const data = {
      reviews,
      myTravels: cardU1,
      sharedTravels: cardU2,
      user,
      image: image?.image,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};
