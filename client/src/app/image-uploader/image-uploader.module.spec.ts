import { ImageUploaderModule } from './image-uploader.module';

describe('ImageUploaderModule', () => {
  let imageUploaderModule: ImageUploaderModule;

  beforeEach(() => {
    imageUploaderModule = new ImageUploaderModule();
  });

  it('should create an instance', () => {
    expect(imageUploaderModule).toBeTruthy();
  });
});
