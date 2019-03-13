
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() uploadUrl;
  @Input() urls;

  @Input() size = 'sm';
  @Output() afterDelete = new EventEmitter();
  @Output() afterUpload = new EventEmitter();

  file;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  onFileChange(event) {
    const self = this;
    const image = new Image();
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      image.onload = function(imageEvent) {
        const blob = self.getBlob(image, self.size); // type:x, size:y
        const picFile = new File([blob], file.name);

        self.postFile(self.uploadUrl, picFile).subscribe(x => {
          self.afterUpload.emit({
            name: x.result.files.file[0].name,
            // originalFilename: "alashijiaxueyu.jpg"
            // size: 17353
            // type: "image/jpeg"
          });
        });
      };

      reader.onload = (readerEvent: any) => {
        // use for trigger image.onload event
        image.src = readerEvent.target.result;
      };


      reader.readAsDataURL(file);
    }
  }

  // file --- { name:x, size:y, type: z }
  public postFile(url: string, file: File): Observable<any> {
    const formData = new FormData();
    // for (const key in customData) {
    //   if (customData.hasOwnProperty(key)) {
    //     formData.append(key, customData[key]);
    //   }
    // }
    formData.append('file', file);

    return this.http.post(url, formData);
  }

  onUpload() {

  }

  onDelete() {

  }

  dataURLToBlob(dataURL) {
    const BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) === -1) {
        const parts: string[] = dataURL.split(',');
        const contentType: string = parts[0].split(':')[1];
        const raw = parts[1];

        return new Blob([raw], {type: contentType});
    } else {
      const parts = dataURL.split(BASE64_MARKER);
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;

      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {type: contentType});
    }
  }

  // scale image inside frame
  resizeImage(frame_w: number, frame_h: number, w: number, h: number) {
    let rw = 0;
    let rh = 0;

    if (h * frame_w / w > frame_h) {
      rh = frame_h;
      rw = w * frame_h / h;
    } else {
      rw = frame_w;
      rh = h * frame_w / w;
    }
    return { 'w': Math.round(rw), 'h': Math.round(rh), 'padding_top': Math.round((frame_h - rh) / 2) };
  }

  getBlob(image, size = 'sm') {
    const canvas = document.createElement('canvas');
    if (size === 'sm') {
      const d = this.resizeImage(240, 320, image.width, image.height);
      canvas.width = d.w;
      canvas.height = d.h;
    } else if (size === 'lg') {
      const d = this.resizeImage(320, 480, image.width, image.height);
      canvas.width = d.w;
      canvas.height = d.h;
    } else {
      const d = this.resizeImage(240, 320, image.width, image.height);
      canvas.width = image.width;
      canvas.height = image.height;
    }
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    return this.dataURLToBlob(dataUrl);
  }
}
