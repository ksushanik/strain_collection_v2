import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('api/v1/search')
@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @CheckPolicies(
    (ability) =>
      ability.can('read', 'Strain') ||
      ability.can('read', 'Sample') ||
      ability.can('read', 'Storage') ||
      ability.can('read', 'Media') ||
      ability.can('read', 'Method') ||
      ability.can('read', 'Legend') ||
      ability.can('read', 'Settings'),
  )
  async search(
    @Req() req: Request & { user?: Partial<User> & { role?: { key?: string } } },
    @Query(new ValidationPipe({ transform: true })) query: SearchQueryDto,
  ) {
    return this.searchService.search({
      user: req.user,
      query: query.query,
      mode: query.mode ?? 'preview',
      perSection: query.perSection,
    });
  }
}

