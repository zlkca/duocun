import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

const THUMBNAIL_W = 80;
const THUMBNAIL_H = 60;
const MEDIA_URL = environment.MEDIA_URL;

@Component({
	selector: 'app-image-viewer',
	templateUrl: './image-viewer.component.html',
	styleUrls: ['./image-viewer.component.scss']
})

export class ImageViewerComponent implements OnInit {
	public _thumbnails = [];
	public _pictures = [];
	public _frame = {'w':0, 'h':0};
	public viewer = {'w':0, 'h':0};
	public image:any;
	public APP_URL = '';//environment.APP_URL.slice(0, -1);

	//-----------------------------------------------
	// pics --- [{index:x, url:x, name:x}]
	@Input() 
	set pictures(pics:any[]){
		let self = this;
		let ts = [];

		if(pics){
			for(var i=0; i<pics.length; i++){
				let rt = self.resizeImage(THUMBNAIL_W, THUMBNAIL_H, pics[i].width, pics[i].height);
				rt['index'] = i;
				rt['url'] = MEDIA_URL + pics[i].image.data;
				rt['name'] = pics[i].name;
				ts.push(rt);
			}			
		}

		this._pictures = pics; 
		this._thumbnails = ts;
		this.image = pics[0];
		this.image.url = ts[0].url;
		this.image.name = ts[0].name;
	}

	//-------------------------------------------
	// f --- { w:x, h:y }	
	@Input()
	set frame(f:any){
		// this._frame = f;
		// this.viewer = { 'w': f.w, 'h': f.h + THUMBNAIL_H + 20 };
	}

	constructor() { 

	}

	ngOnInit() {

	}

    resizeImage(frame_w:number, frame_h:number, w: number, h: number){
        var rw = 0;
        var rh = 0;

        var h1 = h * frame_w / w;  
        if( h1 > frame_h ){
          rh = frame_h;
          rw = w * frame_h / h;
        }else{
          rw = frame_w;
          rh = h * frame_w / w;
        }
        return {'w':Math.round(rw), 'h':Math.round(rh), 'padding_top': Math.round((frame_h - rh)/2) };
    }

	onSelect(thumbnail:any){
		this.image = this._pictures[thumbnail.index];
		// this.image.url = this.API_URL + thumbnail.url;
		// this.image.title = thumbnail.title;
	}

}
