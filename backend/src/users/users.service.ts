import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { group: true, role: true },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { group: true, role: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // Ensure default USER role exists; connect if no role provided.
    await this.prisma.role.upsert({
      where: { key: 'USER' },
      update: {},
      create: { name: 'User', key: 'USER' },
    });
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role:
          data.role ||
          ({
            connect: { key: 'USER' },
          } as Prisma.RoleCreateNestedOneWithoutUsersInput),
      },
    });
  }
}
