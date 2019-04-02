import { DeliveryModule } from './delivery.module';

describe('DeliveryModule', () => {
  let deliveryModule: DeliveryModule;

  beforeEach(() => {
    deliveryModule = new DeliveryModule();
  });

  it('should create an instance', () => {
    expect(deliveryModule).toBeTruthy();
  });
});
