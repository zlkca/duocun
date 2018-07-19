import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { AuthService } from '../../account/auth.service';
import { SharedService } from '../../shared/shared.service';
import { Product } from '../../commerce/commerce';


const FRAME_WIDTH: number = 480;
const FRAME_HEIGHT: number = 360;
const NORMAL_HEIGHT: number = 340;
const MOBILE_WIDTH: number = 767;

@Component({
    providers: [ProductService],
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
    product: Product = new Product();
    frame: any;
    id: string;
    constructor(private productSvc: ProductService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        const self = this;
        self.frame = self.getFrame();

        self.route.params.subscribe((params: any) => {
            if (params.id) {
                self.id = params.id;
                this.productSvc.getProduct(params.id).subscribe(
                    (r: Product) => {
                        self.product = r;
                    },
                    (err: any) => {
                        self.product = new Product();
                    });
            } else {
                self.product = new Product();
            }
        });
    }

    // get frame size according to the mobile orientation
    getFrame() {
        const w: number = window.innerWidth;
        if (w < MOBILE_WIDTH) {
            const frame_w = w;
            const frame_h = Math.floor(frame_w * 3 / 4);
            const min_frame_h = Math.floor(frame_h * 0.9);
            return { w: frame_w, h: frame_h, min_h: min_frame_h };
        } else {
            return { w: FRAME_WIDTH, h: FRAME_HEIGHT, min_h: NORMAL_HEIGHT };
        }
    }
}
