import { RangeModule } from './range.module';

describe('RangeModule', () => {
  let rangeModule: RangeModule;

  beforeEach(() => {
    rangeModule = new RangeModule();
  });

  it('should create an instance', () => {
    expect(rangeModule).toBeTruthy();
  });
});
