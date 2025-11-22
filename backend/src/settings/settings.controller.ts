import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';

@Controller('api/v1/settings')
@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('ui-bindings')
  @CheckPolicies((ability) => ability.can('read', 'Settings'))
  async getUiBindings() {
    return this.settingsService.getUiBindings();
  }

  @Put('ui-bindings')
  @CheckPolicies((ability) => ability.can('update', 'Settings'))
  async updateUiBindings(@Body() bindings: any[]) {
    return this.settingsService.updateUiBindings(bindings);
  }

  @Get('legend')
  @CheckPolicies((ability) => ability.can('read', 'Legend'))
  async getLegend() {
    return this.settingsService.getLegend();
  }

  @Put('legend')
  @CheckPolicies((ability) => ability.can('update', 'Legend'))
  async updateLegend(@Body() payload: { content: string }) {
    return this.settingsService.updateLegend(payload);
  }
}
