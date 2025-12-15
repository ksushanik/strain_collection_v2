import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { PoliciesGuard } from '../casl/policies.guard';
import { Public } from '../decorators/public.decorator';
import { CreateTraitDto } from './dto/create-trait.dto';
import { UpdateTraitDto } from './dto/update-trait.dto';
import { TraitsService } from './traits.service';

@Controller('api/v1')
@ApiTags('Traits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class TraitsController {
  constructor(private readonly traitsService: TraitsService) {}

  // Dictionary endpoint - needs to be public or at least readable
  @Get('dictionary/traits')
  @Public()
  getDictionary() {
    return this.traitsService.getDictionary();
  }

  // CRUD endpoints
  @Get('methods/traits')
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'TraitDefinition'))
  findAll(@Query('search') search?: string) {
    return this.traitsService.findAll(search);
  }

  @Get('methods/traits/:id')
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'TraitDefinition'))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.traitsService.findOne(id);
  }

  @Post('methods/traits')
  @CheckPolicies((ability) => ability.can('create', 'TraitDefinition'))
  create(@Body() dto: CreateTraitDto) {
    return this.traitsService.create(dto);
  }

  @Put('methods/traits/:id')
  @CheckPolicies((ability) => ability.can('update', 'TraitDefinition'))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTraitDto) {
    return this.traitsService.update(id, dto);
  }

  @Delete('methods/traits/:id')
  @CheckPolicies((ability) => ability.can('delete', 'TraitDefinition'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.traitsService.remove(id);
  }
}
