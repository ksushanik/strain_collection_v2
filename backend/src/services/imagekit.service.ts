import { Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

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
  private localMode = false;
  private localDir = path.join(process.cwd(), 'uploads');
  private publicUrlBase = '/uploads';
  private uploadTimeoutMs: number;
  private deleteTimeoutMs: number;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');
    this.uploadTimeoutMs = this.parseEnvInt(
      'IMAGEKIT_UPLOAD_TIMEOUT_MS',
      15000,
    );
    this.deleteTimeoutMs = this.parseEnvInt(
      'IMAGEKIT_DELETE_TIMEOUT_MS',
      10000,
    );
    this.maxRetries = this.parseEnvInt('IMAGEKIT_MAX_RETRIES', 2);
    this.retryDelayMs = this.parseEnvInt('IMAGEKIT_RETRY_DELAY_MS', 500);

    if (!publicKey || !privateKey || !urlEndpoint) {
      // Fallback to local storage mode
      this.localMode = true;
      fs.mkdirSync(this.localDir, { recursive: true });
      return;
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
    if (this.localMode) {
      const ext = path.extname(fileName) || '.bin';
      const safeName = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
      const destDir = path.join(this.localDir, folder);
      fs.mkdirSync(destDir, { recursive: true });
      const fullPath = path.join(destDir, safeName);
      await fs.promises.writeFile(fullPath, file);

      const url = `${this.publicUrlBase}/${folder}/${safeName}`;
      return {
        fileId: safeName,
        name: safeName,
        url,
        thumbnailUrl: url,
        height: 0,
        width: 0,
        size: file.length,
        filePath: fullPath,
        fileType: ext.replace('.', '') || 'bin',
      };
    } else {
      try {
        const response = await this.withRetries(
          () =>
            this.withTimeout(
              this.imagekit.upload({
                file: file.toString('base64'),
                fileName: fileName,
                folder: folder,
                useUniqueFileName: true,
              }),
              this.uploadTimeoutMs,
              'ImageKit upload',
            ),
          this.maxRetries,
          this.retryDelayMs,
          'ImageKit upload',
        );

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
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to upload image to ImageKit: ${message}`);
      }
    }
  }

  async deleteImage(fileId: string): Promise<void> {
    if (this.localMode) {
      // In local mode просто игнорируем удаление: файлы не критичны
      return;
    } else {
      try {
        await this.withRetries(
          () =>
            this.withTimeout(
              this.imagekit.deleteFile(fileId),
              this.deleteTimeoutMs,
              'ImageKit delete',
            ),
          this.maxRetries,
          this.retryDelayMs,
          'ImageKit delete',
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to delete image from ImageKit: ${message}`);
      }
    }
  }

  getAuthenticationParameters(): {
    signature: string;
    expire: number;
    token: string;
  } {
    if (this.localMode) {
      return { signature: '', expire: 0, token: '' };
    }
    return this.imagekit.getAuthenticationParameters();
  }

  private parseEnvInt(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    label: string,
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private async withRetries<T>(
    fn: () => Promise<T>,
    retries: number,
    delayMs: number,
    label: string,
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (error) {
        if (attempt >= retries) throw error;
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
