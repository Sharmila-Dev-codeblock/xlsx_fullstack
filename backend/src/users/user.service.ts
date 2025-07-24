import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  validateExcel(fileBuffer: Buffer): User[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonData.length === 0) {
      throw new BadRequestException('The Excel file has no data.');
    }

    const headers = Object.keys(jsonData[0]);
    if (
      headers[0]?.toLowerCase() !== 'id' ||
      headers[1]?.toLowerCase() !== 'name' ||
      headers[2]?.toLowerCase() !== 'email'
    ) {
      throw new BadRequestException(
        `Headers must be: 'id', 'name', 'email'. Received: ${headers.join(', ')}`,
      );
    }

    jsonData.forEach((row, index) => {
      if (!row.id || !row.name || !row.email) {
        throw new BadRequestException(
          `Row ${index + 2}: Empty value found in one or more required fields.`,
        );
      }
    });

    return jsonData as User[];
  }

  async handleUpload(file: Express.Multer.File) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const users = this.validateExcel(fileBuffer);
      await this.userRepo.save(users);
      return { message: 'File uploaded successfully.', count: users.length };
    } catch (error) {
      throw error; 
    } finally {
     // fs.unlinkSync(file.path); // To delete files
    }
  }

  async getAllUsers() {
    return this.userRepo.find();
  }
}
