import {faker} from "@faker-js/faker";
import {getUsers, randNum} from "./seed";
import {getCategories} from "./categoriesSeed";
import {getTags} from "./tagsSeed";


export const postSeed = async (prisma, user) => {

  const max = randNum(75);

  for (let i = 0; i < max; i++) {
    const userLike = await getUsers(randNum(500));
    const userComments = await getUsers(randNum(500));
    const categories = await getCategories(prisma, randNum(5));
    const tags = await getTags(prisma, randNum(15));

    await prisma.posts.create({
      data: {
        title: faker.word.adverb(),
        description: faker.lorem.sentence(),
        image: faker.image.abstract(),
        userId: user.id,
        likes: {
          create: userLike.map((user) => {
            return {
              userId: user.id,
            }
          })
        },
        comments: {
          create: userComments.map((user) => {
            return {
              userId: user.id,
              content: faker.lorem.paragraph(),
            }
          })
        },
        postCategories: {
          create: categories.map((category) => {
            return {
              categoryId: category.id,
            }
          })
        },
        postTags: {
          create: tags.map((tag) => {
            return {
              tagId: tag.id,
            }
          })
        },
      }
    });
  }
}
