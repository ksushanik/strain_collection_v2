import { Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';
import { ConfigService } from '@nestjs/config';

export interface ImageKitUploadResponse {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    height: number;
    width: number;
    size: number;
    filePath: string;
    fileType: string;
}

@Injectable()
export class ImageKitService {
    private imagekit: ImageKit;

    constructor(private configService: ConfigService) {
        const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
        const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
        const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

        if (!publicKey || !privateKey || !urlEndpoint) {
            throw new Error('ImageKit credentials are not configured. Please check your .env file.');
        }

        this.imagekit = new ImageKit({
            publicKey,
            privateKey,
            urlEndpoint,
        });
    }

    async uploadImage(
        file: Buffer,
        fileName: string,
        folder: string = 'sample-photos',
    ): Promise<ImageKitUploadResponse> {
        try {
            const response = await this.imagekit.upload({
                file: file.toString('base64'),
                fileName: fileName,
                folder: folder,
                useUniqueFileName: true,
            });

            return {
                fileId: response.fileId,
                name: response.name,
                url: response.url,
                thumbnailUrl: response.thumbnailUrl,
                height: response.height,
                width: response.width,
                size: response.size,
                filePath: response.filePath,
                fileType: response.fileType,
            };
        } catch (error) {
            throw new Error(`Failed to upload image to ImageKit: ${error.message}`);
        }
    }

    async deleteImage(fileId: string): Promise<void> {
        try {
            await this.imagekit.deleteFile(fileId);
        } catch (error) {
            throw new Error(`Failed to delete image from ImageKit: ${error.message}`);
        }
    }

    getAuthenticationParameters(): {
        signature: string;
        expire: number;
        token: string;
    } {
        return this.imagekit.getAuthenticationParameters();
    }
}
