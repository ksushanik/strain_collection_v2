import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { StrainsService } from './strains.service';
import { CreateStrainDto } from './dto/create-strain.dto';
import { UpdateStrainDto } from './dto/update-strain.dto';
import { StrainQueryDto } from './dto/strain-query.dto';

@Controller('api/v1/strains')
export class StrainsController {
    constructor(private readonly strainsService: StrainsService) { }

    @Get()
    findAll(@Query(new ValidationPipe({ transform: true })) query: StrainQueryDto) {
        return this.strainsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.strainsService.findOne(id);
    }

    @Post()
    create(@Body() createStrainDto: CreateStrainDto) {
        return this.strainsService.create(createStrainDto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStrainDto: UpdateStrainDto,
    ) {
        return this.strainsService.update(id, updateStrainDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.strainsService.remove(id);
    }
}
