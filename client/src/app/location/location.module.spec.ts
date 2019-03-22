import { LocationModule } from './location.module';

describe('LocationModule', () => {
  let locationModule: LocationModule;

  beforeEach(() => {
    locationModule = new LocationModule();
  });

  it('should create an instance', () => {
    expect(locationModule).toBeTruthy();
  });
});
