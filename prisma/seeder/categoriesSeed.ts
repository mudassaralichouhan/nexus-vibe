import {faker} from "@faker-js/faker";
import {randNum} from "./seed";

export const categoriesSeed = async (prisma) => {

  const max = randNum(100);

  for (let i = 0; i < max; i++) {
    const slug = faker.lorem.slug();
    await prisma.categories.upsert({
      where: {
        slug: slug,
      },
      create: {
        slug: slug,
        name: slug.replace('-', ' '),
        detail: faker.lorem.sentence(),
        image:  faker.image.avatar(),
      },
      update: {}
    });
  }
}

export const getCategories = async (prisma, take) => {
  return await prisma.categories.findMany({
    take: take,
    select: {
      id: true,
    },
  });
};
