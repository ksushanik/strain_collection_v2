import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreateStorageBoxDto } from './dto/create-storage-box.dto';
import { AllocateStrainDto } from './dto/allocate-strain.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AuditLogInterceptor } from '../audit/audit-log.interceptor';

@Controller('api/v1/storage')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(AuditLogInterceptor)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('boxes')
  @CheckPolicies((ability) => ability.can('read', 'Storage'))
  findAllBoxes() {
    return this.storageService.findAllBoxes();
  }

  @Get('boxes/:id')
  @CheckPolicies((ability) => ability.can('read', 'Storage'))
  findBox(@Param('id', ParseIntPipe) id: number) {
    return this.storageService.findBox(id);
  }

  @Post('boxes')
  @CheckPolicies((ability) => ability.can('create', 'Storage'))
  createBox(@Body() createBoxDto: CreateStorageBoxDto) {
    return this.storageService.createBox(createBoxDto);
  }

  @Post('allocate')
  @CheckPolicies((ability) => ability.can('update', 'Storage'))
  allocateStrain(@Body() allocateDto: AllocateStrainDto) {
    return this.storageService.allocateStrain(allocateDto);
  }

  @Delete('allocate/:id')
  @CheckPolicies((ability) => ability.can('update', 'Storage'))
  deallocateStrain(@Param('id', ParseIntPipe) id: number) {
    return this.storageService.deallocateStrain(id);
  }
}
