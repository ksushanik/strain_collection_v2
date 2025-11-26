process.env.SKIP_ADMIN = 'true';

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Media e2e (smoke)', () => {
  let app: INestApplication;
  let token: string;
  let mediaId: number;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

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

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const email = `media${Date.now()}@example.com`;
    const password = 'P@ssword123';
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Media Tester' })
      .expect(201);

    await prisma.user.update({
      where: { email: registerRes.body.email },
      data: { role: { connect: { key: 'ADMIN' } } },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates media and lists with pagination', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/media')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'LB broth', composition: 'Tryptone, yeast extract, NaCl' })
      .expect(201);
    mediaId = res.body.id;

    const list = await request(app.getHttpServer())
      .get('/api/v1/media?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.data).toEqual(expect.any(Array));
    expect(list.body.meta).toHaveProperty('total');
  });

  it('updates and deletes media', async () => {
    await request(app.getHttpServer())
      .put(`/api/v1/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'LB broth updated', composition: 'Updated text' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
