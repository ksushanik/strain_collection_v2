import { Public } from '../decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { StrainsService } from './strains.service';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';
import { CreateStrainPhenotypeDto } from './dto/create-strain-phenotype.dto';
import { UpdateStrainPhotoDto } from './dto/update-strain-photo.dto';
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
  constructor(private readonly strainsService: StrainsService) {}

  @Get()
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'Strain'))
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: StrainQueryDto,
  ) {
    return this.strainsService.findAll(query);
  }

  @Get(':id')
  @Public()
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

  @Get(':id/traits')
  @Public()
  @CheckPolicies((ability) => ability.can('read', 'Strain'))
  getTraits(@Param('id', ParseIntPipe) id: number) {
    return this.strainsService.getPhenotypes(id);
  }

  @Post(':id/traits')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  addTrait(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateStrainPhenotypeDto,
  ) {
    return this.strainsService.addPhenotype(id, dto);
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only image files (JPEG, PNG, GIF, WebP) are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
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

  @Patch('photos/:photoId')
  @CheckPolicies((ability) => ability.can('update', 'Strain'))
  updatePhoto(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateStrainPhotoDto,
  ) {
    return this.strainsService.updatePhoto(photoId, dto);
  }
}
