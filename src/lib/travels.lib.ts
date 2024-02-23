import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const Travel = prisma.travels;
const User = prisma.users;
const Location = prisma.cat_Locations;
const RequestTravel = prisma.travel_Request;
const Expenses = prisma.det_Expenses;
const Extras = prisma.det_Extras;

export const getTravel = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const travelFound = await Travel.findUnique({ where: { id } });
    if (!travelFound) {
      return null;
    }
    return travelFound;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};
export const getOneUser = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const userFound = await User.findUnique({ where: { id } });
    if (!userFound) {
      return null;
    }
    return userFound;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getLocation = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const locationFound = await Location.findUnique({ where: { id } });
    if (!locationFound) {
      return null;
    }
    return locationFound;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getRequestTravel = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const requestTravel = await RequestTravel.findUnique({ where: { id } });
    if (!requestTravel) {
      return null;
    }
    return requestTravel;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getExpenses = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const expensesFound = await Expenses.findUnique({ where: { id } });
    if (!expensesFound) {
      return null;
    }
    return expensesFound;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getExtras = async (id: string) => {
  if (!id) {
    return null;
  }
  try {
    const extrasFound = await Extras.findUnique({ where: { id } });
    if (!extrasFound) {
      return null;
    }
    return extrasFound;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};
