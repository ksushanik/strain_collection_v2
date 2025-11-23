import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Storage e2e (limited smoke)', () => {
  let app: INestApplication;
  let token: string;
  let boxId: number;
  let prisma: PrismaService;

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

    // create and login admin user
    const email = `test${Date.now()}@example.com`;
    const password = 'P@ssword123';
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Tester' })
      .expect(201);

    await prisma.user.update({
      where: { email: registerRes.body.email },
      data: { role: 'ADMIN' },
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

  it('creates storage box and fetches boxes', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/storage/boxes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Test Box',
        storageType: 'FRIDGE_MINUS_20',
        rows: 9,
        cols: 9,
        description: 'e2e box',
      })
      .expect(201);

    boxId = res.body.id;
    expect(res.body.rows).toBe(9);

    const list = await request(app.getHttpServer())
      .get('/api/v1/storage/boxes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
  });

  it('allocates and deallocates a cell', async () => {
    const cellCode = 'A1';
    // need a strain to allocate
    const sample = await request(app.getHttpServer())
      .post('/api/v1/samples')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: `E2E-SAMPLE-${Date.now()}`,
        sampleType: 'SOIL',
        siteName: 'e2e site',
        collectedAt: new Date().toISOString(),
      })
      .expect(201);

    const strain = await request(app.getHttpServer())
      .post('/api/v1/strains')
      .set('Authorization', `Bearer ${token}`)
      .send({
        identifier: `E2E-${Date.now()}`,
        sampleId: sample.body.id,
        seq: false,
        phosphates: false,
        siderophores: false,
        pigmentSecretion: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ strainId: strain.body.id, isPrimary: true })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/unallocate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
