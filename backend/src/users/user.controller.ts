import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import * as path from 'path';

/**
 * File to have its original name
 */
const storage = diskStorage({
  destination: './uploadedFiles',
  filename: (_req, file, fn) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    fn(null, `${name}-${Date.now()}${ext}`);
  },
});

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.userService.handleUpload(file);
  }

  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}



