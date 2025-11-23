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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CreateStorageBoxDto } from './dto/create-storage-box.dto';
import {
  AllocateStrainDto,
  BulkAllocateStrainDto,
} from './dto/allocate-strain.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AuditLogInterceptor } from '../audit/audit-log.interceptor';

@Controller('api/v1/storage')
@ApiTags('Storage')
@ApiBearerAuth()
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

  @Post('boxes/:boxId/cells/:cellCode/allocate')
  @CheckPolicies((ability) => ability.can('update', 'Storage'))
  allocateStrain(
    @Param('boxId', ParseIntPipe) boxId: number,
    @Param('cellCode') cellCode: string,
    @Body() allocateDto: Omit<AllocateStrainDto, 'boxId' | 'cellCode'>,
  ) {
    return this.storageService.allocateStrain({
      ...allocateDto,
      boxId,
      cellCode,
    });
  }

  @Post('boxes/:boxId/bulk-allocate')
  @CheckPolicies((ability) => ability.can('update', 'Storage'))
  bulkAllocate(
    @Param('boxId', ParseIntPipe) boxId: number,
    @Body() payload: Omit<BulkAllocateStrainDto, 'boxId'>,
  ) {
    return this.storageService.bulkAllocate({
      boxId,
      allocations: (payload.allocations || []).map((a) => ({
        ...a,
        boxId,
      })),
    });
  }

  @Delete('boxes/:boxId/cells/:cellCode/unallocate')
  @CheckPolicies((ability) => ability.can('update', 'Storage'))
  deallocateStrain(
    @Param('boxId', ParseIntPipe) boxId: number,
    @Param('cellCode') cellCode: string,
  ) {
    return this.storageService.deallocateStrain(boxId, cellCode);
  }
}
