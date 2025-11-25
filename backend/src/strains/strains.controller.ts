import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StrainsService } from './strains.service';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AuditLogInterceptor } from '../audit/audit-log.interceptor';

@Controller('api/v1/strains')
@ApiTags('Strains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(AuditLogInterceptor)
export class StrainsController {
  constructor(private readonly strainsService: StrainsService) { }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Strain'))
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: StrainQueryDto,
  ) {
    return this.strainsService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'Strain'))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.strainsService.findOne(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Strain'))
  create(@Body() createStrainDto: CreateStrainDto) {
    return this.strainsService.create(createStrainDto);
  }

  @Put(':id')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStrainDto: UpdateStrainDto,
  ) {
    return this.strainsService.update(id, updateStrainDto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'Strain'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.strainsService.remove(id);
  }

  @Post(':id/media')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  addMedia(
    @Param('id', ParseIntPipe) id: number,
    @Body('mediaId', ParseIntPipe) mediaId: number,
    @Body('notes') notes?: string,
  ) {
    return this.strainsService.addMedia(id, mediaId, notes);
  }

  @Delete(':id/media/:mediaId')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  removeMedia(
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ) {
    return this.strainsService.removeMedia(id, mediaId);
  }

  @Post(':id/photos')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.strainsService.uploadPhoto(id, file);
  }

  @Delete('photos/:photoId')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  deletePhoto(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.strainsService.deletePhoto(photoId);
  }
}
