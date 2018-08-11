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

    toDateTimeString(s) {
        // s --- dd-mm-yyy:hh:mm:ss.z000
        return s.split('.')[0].replace('T', ' ');
    }

    getTotal(items) {
        let total = 0;
        items.forEach(item => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }
}

