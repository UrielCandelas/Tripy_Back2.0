import { Decimal } from "@prisma/client/runtime/library";

export interface DataCards {
  id: string;
  usersName: string | undefined;
  quantity: Decimal | undefined;
  expenseName: string | undefined;
  date: String;
  companions: number;
}

export interface Contact {
  id: string;
  name: string;
  userName: string;
  lastName: string;
  email: string;
}
