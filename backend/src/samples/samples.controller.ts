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
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/sample-query.dto';

@Controller('api/v1/samples')
export class SamplesController {
    constructor(private readonly samplesService: SamplesService) { }

    @Get()
    findAll(@Query(new ValidationPipe({ transform: true })) query: SampleQueryDto) {
        return this.samplesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.samplesService.findOne(id);
    }

    @Post()
    create(@Body() createSampleDto: CreateSampleDto) {
        return this.samplesService.create(createSampleDto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSampleDto: UpdateSampleDto,
    ) {
        return this.samplesService.update(id, updateSampleDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.samplesService.remove(id);
    }

    @Post(':id/photos')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
            }
        },
    }))
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
    deletePhoto(@Param('photoId', ParseIntPipe) photoId: number) {
        return this.samplesService.deletePhoto(photoId);
    }
}
