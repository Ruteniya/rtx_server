import { Test, TestingModule } from '@nestjs/testing';
import { Seeder } from './seeder';

describe('Seeder', () => {
  let provider: Seeder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Seeder],
    }).compile();

    provider = module.get<Seeder>(Seeder);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
