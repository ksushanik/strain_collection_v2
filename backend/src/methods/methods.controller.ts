import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { PoliciesGuard } from '../casl/policies.guard';
import { Public } from '../decorators/public.decorator';
import { CreateMethodDto } from './dto/create-method.dto';
import { MethodQueryDto } from './dto/method-query.dto';
import { UpdateMethodDto } from './dto/update-method.dto';
import { MethodsService } from './methods.service';

@Controller('api/v1/methods')
@ApiTags('Methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class MethodsController {
  constructor(private readonly methodsService: MethodsService) {}

  @Get()
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'Method'))
  findAll(@Query() query: MethodQueryDto) {
    return this.methodsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'Method'))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.methodsService.findOne(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Method'))
  create(@Body() dto: CreateMethodDto) {
    return this.methodsService.create(dto);
  }

  @Put(':id')
  @CheckPolicies((ability) => ability.can('update', 'Method'))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMethodDto) {
    return this.methodsService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'Method'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.methodsService.remove(id);
  }
}

