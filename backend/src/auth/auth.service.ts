import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string): Promise<{ accessToken: string }> {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const payload = { sub: user.id, email: user.email }; 
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Email already in use');
    }
    throw error;
  }
}

async login(email: string, password: string): Promise<{ accessToken: string }> {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const payload = { sub: user.id, email: user.email }; 
  const accessToken = this.jwtService.sign(payload);
  return { accessToken };
}
}
