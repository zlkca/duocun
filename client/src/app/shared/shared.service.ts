import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class SharedService {

    private subject = new Subject<any>();

    constructor() { }

    emitMsg(msg: any) {
        this.subject.next(msg);
    }

    getMsg(): Observable<any> {
        return this.subject.asObservable();
    }

    // scale image inside frame
    resizeImage(frame_w: number, frame_h: number, w: number, h: number) {
        var rw = 0;
        var rh = 0;

        var h1 = h * frame_w / w;
        if (h1 > frame_h) {
            rh = frame_h;
            rw = w * frame_h / h;
        } else {
            rw = frame_w;
            rh = h * frame_w / w;
        }
        return { 'w': Math.round(rw), 'h': Math.round(rh), 'padding_top': Math.round((frame_h - rh) / 2) };
    }
}

