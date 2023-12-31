import {faker} from "@faker-js/faker";
import {randNum} from "./seed";

export const tagsSeed = async (prisma) => {

  const max = randNum(100);

  for (let i = 0; i < max; i++) {
    const slug = faker.lorem.slug();
    await prisma.tags.upsert({
      where: {
        slug: slug,
      },
      create: {
        slug: slug
      },
      update: {}
    });
  }
}

export const getTags = async (prisma, take) => {
  return await prisma.tags.findMany({
    take: take,
    select: {
      id: true,
    },
  });
};