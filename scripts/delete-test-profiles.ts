import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testNames = [
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte',
  'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail',
  'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery',
  'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria',
  'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope',
  'Layla', 'Riley', 'Zoey', 'Nora', 'Lily',
  'Eleanor', 'Hannah', 'Lillian', 'Addison', 'Aubrey',
  'Ellie', 'Stella', 'Natalie', 'Zoe', 'Leah'
];

async function deleteTestProfiles() {
  console.log('Deleting test profiles...');

  try {
    // Delete profiles that match test name patterns
    const deleteResult = await prisma.profiles.deleteMany({
      where: {
        OR: testNames.map(name => ({
          name: {
            startsWith: name,
          },
        })),
      },
    });

    console.log(`✅ Deleted ${deleteResult.count} test profiles`);

    // Also try to delete by test user if exists
    const testUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: { contains: 'test-model' } },
          { name: 'Test Model' },
        ],
        account_type: 'model',
      },
    });

    if (testUser) {
      // Delete remaining profiles for test user
      const remainingProfiles = await prisma.profiles.deleteMany({
        where: {
          user_id: testUser.id,
        },
      });
      console.log(`✅ Deleted ${remainingProfiles.count} additional profiles from test user`);

      // Delete the test user
      await prisma.users.delete({
        where: { id: testUser.id },
      });
      console.log('✅ Deleted test user');
    }

  } catch (error) {
    console.error('Error deleting test profiles:', error);
    throw error;
  }
}

async function main() {
  try {
    await deleteTestProfiles();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

