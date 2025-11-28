import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Fort Worth',
  'Charlotte', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Detroit', 'Nashville', 'Portland', 'Oklahoma City',
  'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
  'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City',
  'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh'
];

const names = [
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte',
  'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail',
  'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery',
  'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria',
  'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope',
  'Layla', 'Riley', 'Zoey', 'Nora', 'Lily',
  'Eleanor', 'Hannah', 'Lillian', 'Addison', 'Aubrey',
  'Ellie', 'Stella', 'Natalie', 'Zoe', 'Leah'
];

async function createTestProfiles() {
  console.log('Creating 40 test profiles...');

  // First, check if we have any users with account_type 'model'
  let modelUser = await prisma.users.findFirst({
    where: { account_type: 'model' },
  });

  // If no model user exists, create one
  if (!modelUser) {
    console.log('No model user found. Creating a test model user...');
    modelUser = await prisma.users.create({
      data: {
        name: 'Test Model',
        email: `test-model-${Date.now()}@example.com`,
        password: '$2b$10$dummy.hash.for.testing.purposes.only',
        account_type: 'model',
        balance: 1000,
      },
    });
    console.log(`Created model user with ID: ${modelUser.id}`);
  }

  const profiles = [];

  for (let i = 0; i < 40; i++) {
    const city = cities[i % cities.length];
    const name = names[i % names.length];
    const age = 20 + (i % 20); // Age between 20-39
    const price = 100 + (i % 900); // Price between 100-999

    // Create profile
    const profile = await prisma.profiles.create({
      data: {
        user_id: modelUser.id,
        name: `${name} ${i + 1}`,
        age: age,
        city: city,
        height: 160 + (i % 30), // Height between 160-189 cm
        weight: 50 + (i % 30), // Weight between 50-79 kg
        bust: ['A', 'B', 'C', 'D'][i % 4],
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        telegram: `@${name.toLowerCase()}${i + 1}`,
        whatsapp: `+1-555-${String(i).padStart(4, '0')}`,
        currency: 'USD',
        price_30min: price,
        price_1hour: price * 1.5,
        price_2hours: price * 2.5,
        price_night: price * 5,
        description: `Professional escort in ${city}. Experienced and verified.`,
        services: 'Outcall, Incall, Dinner Date, Travel Companion',
        is_active: true,
        is_verified: i % 3 === 0, // Every 3rd profile is verified
        // Some profiles have boost (expires in future)
        boost_expires_at: i % 5 === 0 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        last_payment_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      },
    });

    profiles.push(profile);
    console.log(`Created profile ${i + 1}/40: ${profile.name} in ${city}`);
  }

  console.log(`\n✅ Successfully created ${profiles.length} test profiles!`);
  console.log(`- Active profiles: ${profiles.filter(p => p.is_active).length}`);
  console.log(`- Verified profiles: ${profiles.filter(p => p.is_verified).length}`);
  console.log(`- Boosted profiles: ${profiles.filter(p => p.boost_expires_at).length}`);

  return profiles;
}

async function main() {
  try {
    await createTestProfiles();
  } catch (error) {
    console.error('Error creating test profiles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

