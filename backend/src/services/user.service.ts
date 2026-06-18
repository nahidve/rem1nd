import { prisma } from "../config/prisma.js";

export async function findOrCreateUser(
  firebaseUid: string,
  email?: string,
  name?: string,
) {
  let user = await prisma.user.findUnique({
    where: {
      firebaseUid,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        name,
      },
    });
  }

  return user;
}
