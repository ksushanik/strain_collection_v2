import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/v1/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('ui-bindings')
    async getUiBindings() {
        return this.settingsService.getUiBindings();
    }

    @Put('ui-bindings')
    async updateUiBindings(@Body() bindings: any[]) {
        return this.settingsService.updateUiBindings(bindings);
    }
}
