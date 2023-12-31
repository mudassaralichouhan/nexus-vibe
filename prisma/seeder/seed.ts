import {Prisma, PrismaClient} from '@prisma/client'

const prismaSeeder = new PrismaClient()
import {faker} from '@faker-js/faker'
import bcrypt from "bcrypt";
import {postSeed} from "./postSeed";
import {tagsSeed} from "./tagsSeed";
import {categoriesSeed} from "./categoriesSeed";

async function main() {

  await tagsSeed(prismaSeeder);
  await categoriesSeed(prismaSeeder);

  const numberOfUsers = randNum(5);

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('1234567890', salt);

  for (let i = 0; i < numberOfUsers; i++) {
    const email = faker.internet.email().toLowerCase();

    const user = await prismaSeeder.users.upsert({
      where: {email: email},
      update: {},
      create: {
        email: email,
        name: faker.person.fullName(),
        password: password,
        role: 'USER',
        profile: {
          create: {
            bio: faker.person.bio(),
            photo: faker.image.avatar(),
            coverPhoto: faker.image.abstract(),
            about: faker.lorem.paragraph(),
            gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'NONE']),
            relationship: faker.helpers.arrayElement(['MARRIED', 'SINGLE']),
          }
        },
        address: {
          create: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            country: faker.location.country()
          }
        },
      },
    });
    await postSeed(prismaSeeder, user);

    console.log(`User created: ${user.name} - ${user.email}`);
  }
}

export const randNum = (max: number) => {
  return Math.floor(Math.random() * max);
}

export const getUsers = async (take: number) => {
  return await prismaSeeder.users.findMany({
    skip: 0,
    take: take,
    select: {
      id: true,
    },
  });
};

main()
  .then(async () => {
    await prismaSeeder.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prismaSeeder.$disconnect()
    process.exit(1)
  })
