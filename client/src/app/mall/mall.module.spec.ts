import { MallModule } from './mall.module';

describe('MallModule', () => {
  let mallModule: MallModule;

  beforeEach(() => {
    mallModule = new MallModule();
  });

  it('should create an instance', () => {
    expect(mallModule).toBeTruthy();
  });
});
