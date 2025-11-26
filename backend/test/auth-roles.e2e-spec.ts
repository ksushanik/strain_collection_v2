process.env.SKIP_ADMIN = 'true';

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth roles & storage permissions e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let boxId: number;
  let strainId: number;
  let sampleTypeId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    await prisma.role.upsert({
      where: { key: 'ADMIN' },
      update: {},
      create: { name: 'Admin', key: 'ADMIN' },
    });
    await prisma.role.upsert({
      where: { key: 'USER' },
      update: {},
      create: { name: 'User', key: 'USER' },
    });
    const sampleType = await prisma.sampleTypeDictionary.upsert({
      where: { slug: 'soil' },
      update: {},
      create: { name: 'Soil', slug: 'soil' },
    });
    sampleTypeId = sampleType.id;

    // Create admin
    const adminEmail = `admin-${Date.now()}@example.com`;
    const adminPassword = 'Admin123!';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password: adminPassword, name: 'Admin' })
      .expect(201);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: { connect: { key: 'ADMIN' } } },
    });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = adminLogin.body.access_token;

    // Create basic user
    const userEmail = `user-${Date.now()}@example.com`;
    const userPassword = 'User123!';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, password: userPassword, name: 'User' })
      .expect(201);
    // Ensure role assignment (register defaults to USER but ensure connect)
    await prisma.user.update({
      where: { email: userEmail },
      data: { role: { connect: { key: 'USER' } } },
    });
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(201);
    userToken = userLogin.body.access_token;

    // Create storage box + strain for allocation tests
    const boxRes = await request(app.getHttpServer())
      .post('/api/v1/storage/boxes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        displayName: 'E2E Role Box',
        rows: 9,
        cols: 9,
      })
      .expect(201);
    boxId = boxRes.body.id;

    const sampleRes = await request(app.getHttpServer())
      .post('/api/v1/samples')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `E2E-SAMPLE-${Date.now()}`,
        sampleType: 'SOIL',
        sampleTypeId,
        siteName: 'RoleSite',
        collectedAt: new Date().toISOString(),
      })
      .expect(201);

    const strainRes = await request(app.getHttpServer())
      .post('/api/v1/strains')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        identifier: `E2E-ROLE-${Date.now()}`,
        sampleId: sampleRes.body.id,
        seq: false,
        phosphates: false,
        siderophores: false,
        pigmentSecretion: false,
      })
      .expect(201);
    strainId = strainRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('denies audit access for USER, allows for ADMIN', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('prevents USER from allocating storage but allows ADMIN', async () => {
    const cellCode = 'A1';

    // user should be forbidden
    await request(app.getHttpServer())
      .post(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ strainId, isPrimary: true })
      .expect(403);

    // admin can allocate
    await request(app.getHttpServer())
      .post(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ strainId, isPrimary: true })
      .expect(201);

    // admin can unallocate
    await request(app.getHttpServer())
      .delete(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/unallocate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
