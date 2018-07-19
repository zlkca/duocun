import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SharedService } from '../shared.service';
import { NgRedux } from '@angular-redux/store';
import { IPicture, PictureActions } from '../../commerce/commerce.actions';

// const ADD_IMAGE = environment.MEDIA_URL + 'add_photo.png';
const ADD_IMAGE = 'add_photo.png';
const FRAME_W = 80;
const FRAME_H = 80;
const IMAGE_W = 80;
const IMAGE_H = 80;

@Component({
    selector: 'app-image-uploader',
    templateUrl: './image-uploader.component.html',
    styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit, OnChanges {

    @ViewChild('uploadInput') uploadInput: ElementRef;
    @Input() picture: any; // single image with structure {image:{data:'url', file:'file data'}}

    _data: any;
    currPic: any = { index: 0, data: '', file: '' };
    pic: any;
    MEDIA_ROOT = environment.MEDIA_URL;

    constructor(private rx: NgRedux<IPicture>, private sharedServ: SharedService) { }

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.picture) {
            this.pic = this.picture;
        }

        const ret = this.sharedServ.resizeImage(FRAME_W, FRAME_H, IMAGE_W, IMAGE_H);

        if (this.pic && this.pic.image && !this.pic.image.data) {
            this.pic.image = { index: 0, data: ADD_IMAGE, file: '' };
        }
    }

    // image : {data:'url', file:'file data'}
    getImageSrc(image: any) {
        if (image.file) {
            return image.data;
        } else {
            return this.MEDIA_ROOT + image.data;
        }
    }

    onLoadImage() {
        const el = this.uploadInput.nativeElement as HTMLElement;
        el.click();
    }

    onDeleteImage() {
        const pic = this.picture;
        pic.image.data = '';
        pic.image.file = '';
        this.picture = pic;
    }

    onImageChange(event: any, i: number) {
        const self = this;
        const reader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (self.picture && self.picture.id) {
                    const newData = { ...self.picture,
                        image: { data: reader.result, file: event.target.files[0] },
                        status: 'change' };
                    self.pic = newData;
                    self.rx.dispatch({
                        type: PictureActions.CHANGE_PICTURE,
                        payload: newData
                    });
                    self.currPic = { data: ADD_IMAGE, file: '' };
                } else {
                    const newData = { ...self.picture, image: { data: reader.result, file: event.target.files[0] }, status: 'add' };
                    self.pic = newData;
                    self.rx.dispatch({
                        type: PictureActions.ADD_PICTURE,
                        payload: newData
                    });
                }
            };
        }
    }

}
