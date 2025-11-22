import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';

@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @CheckPolicies((ability) => ability.can('read', 'Analytics'))
  overview() {
    return this.analyticsService.overview();
  }
}
