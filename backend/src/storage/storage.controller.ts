import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreateStorageBoxDto } from './dto/create-storage-box.dto';
import { AllocateStrainDto } from './dto/allocate-strain.dto';

@Controller('api/v1/storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Get('boxes')
    findAllBoxes() {
        return this.storageService.findAllBoxes();
    }

    @Get('boxes/:id')
    findBox(@Param('id', ParseIntPipe) id: number) {
        return this.storageService.findBox(id);
    }

    @Post('boxes')
    createBox(@Body() createBoxDto: CreateStorageBoxDto) {
        return this.storageService.createBox(createBoxDto);
    }

    @Post('allocate')
    allocateStrain(@Body() allocateDto: AllocateStrainDto) {
        return this.storageService.allocateStrain(allocateDto);
    }

    @Delete('allocate/:id')
    deallocateStrain(@Param('id', ParseIntPipe) id: number) {
        return this.storageService.deallocateStrain(id);
    }
}
