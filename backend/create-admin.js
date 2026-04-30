const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Super Admin';

async function createAdminUser() {
  try {
    console.log('Ensuring admin role and user...');

    const adminRole = await prisma.role.upsert({
      where: { key: 'ADMIN' },
      update: { name: 'Администратор' },
      create: {
        key: 'ADMIN',
        name: 'Администратор',
        description: 'Полный доступ',
        permissions: { all: ['manage'] },
      },
    });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: ADMIN_NAME,
        password: hashedPassword,
        roleId: adminRole.id,
      },
      create: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: hashedPassword,
        roleId: adminRole.id,
      },
      include: {
        role: true,
      },
    });

    console.log('Admin user is ready:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role?.key ?? 'ADMIN');
    console.log('   ID:', user.id);
    console.log('');
    console.log('Login credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void createAdminUser();
