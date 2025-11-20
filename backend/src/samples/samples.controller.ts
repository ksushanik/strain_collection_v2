import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
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
}
