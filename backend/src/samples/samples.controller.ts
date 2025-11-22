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
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AuditLogInterceptor } from '../audit/audit-log.interceptor';

@Controller('api/v1/samples')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(AuditLogInterceptor)
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Sample'))
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: SampleQueryDto,
  ) {
    return this.samplesService.findAll(query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'Sample'))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.samplesService.findOne(id);
  }

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Sample'))
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.samplesService.create(createSampleDto);
  }

  @Put(':id')
  @CheckPolicies((ability) => ability.can('update', 'Sample'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSampleDto: UpdateSampleDto,
  ) {
    return this.samplesService.update(id, updateSampleDto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'Sample'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.samplesService.remove(id);
  }

  @Post(':id/photos')
  @CheckPolicies((ability) => ability.can('create', 'Photo'))
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
    return this.samplesService.uploadPhoto(id, file);
  }

  @Delete('photos/:photoId')
  @CheckPolicies((ability) => ability.can('delete', 'Photo'))
  deletePhoto(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.samplesService.deletePhoto(photoId);
  }
}
