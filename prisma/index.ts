import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

// prisma.$on('query', async (payload: string) => {
//   console.log('beforeExit event triggered with payload:', payload);
// });


prisma.$use(async (params, next) => {
  console.log(`Prisma operation: ${params.model}.${params.action}`);
  console.log(`Operation arguments: ${JSON.stringify(params.args)}`);

  // Execute the original Prisma operation
  const result = await next(params);

  console.log(`Prisma operation result: ${JSON.stringify(result)}`);

  return result;
});

export default prisma;
