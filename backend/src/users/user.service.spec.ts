import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockRepo: { save: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  const bufferFromData = (data: any[][]): Buffer => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  };

  describe('validateExcel', () => {
    it('throws error for empty file', () => {
      const buffer = Buffer.from([]);
      expect(() => service.validateExcel(buffer)).toThrow(BadRequestException);
    });

    it('throws error for invalid headers', () => {
      const buffer = bufferFromData([
        ['wrong', 'header', 'names'],
        ['1', 'John', 'a@b.com'],
      ]);
      expect(() => service.validateExcel(buffer)).toThrow(/Headers must be/);
    });

    it('throws error for empty cells', () => {
      const buffer = bufferFromData([
        ['id', 'name', 'email'],
        ['', 'John', 'a@b.com'],
      ]);
      expect(() => service.validateExcel(buffer)).toThrow(/Row/);
    });

    it('returns valid users for valid file', () => {
      const buffer = bufferFromData([
        ['id', 'name', 'email'],
        ['1', 'Mukesh', 'a@b.com'],
        ['2', 'John', 'john@x.com'],
      ]);

      const users = service.validateExcel(buffer);
      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('id', '1');
    });
  });

  it('should call save and return count in handleUpload()', async () => {
  // Prepare a real temp Excel file buffer
  const data = [
    ['id', 'name', 'email'],
    ['1', 'Test', 'test@example.com'],
    ['2', 'Demo', 'demo@example.com'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  // Save it temporarily to simulate a real file path
  const tempFilePath = path.join(__dirname, 'temp-valid.xlsx');
  fs.writeFileSync(tempFilePath, buffer);

  const file = {
    path: tempFilePath,
  } as Express.Multer.File;

  mockRepo.save.mockResolvedValue([]);

  const result = await service.handleUpload(file);

  expect(result).toEqual({
    message: 'File uploaded successfully.',
    count: 2,
  });

  expect(mockRepo.save).toHaveBeenCalled();

  // Clean up the temporary file
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
});

  it('getAllUsers returns user list', async () => {
    const mockUsers = [{ id: 1, name: 'Mukesh', email: 'a@b.com' }];
    mockRepo.find.mockResolvedValue(mockUsers);
    const result = await service.getAllUsers();
    expect(result).toEqual(mockUsers);
  });
});
