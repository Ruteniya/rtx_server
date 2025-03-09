import { SystemAuthGuard } from './system-auth.guard';

describe('SystemAuthGuard', () => {
  it('should be defined', () => {
    expect(new SystemAuthGuard()).toBeDefined();
  });
});
