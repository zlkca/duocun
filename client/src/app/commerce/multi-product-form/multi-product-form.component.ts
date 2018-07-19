import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CommerceService } from '../commerce.service';
import { NgRedux } from '@angular-redux/store';
import { IPicture } from '../commerce.actions';

@Component({
    selector: 'multi-product-form',
    templateUrl: './multi-product-form.component.html',
    styleUrls: ['./multi-product-form.component.scss']
})
export class MultiProductFormComponent implements OnInit {
    form: FormGroup = this.fb.group({ items: this.fb.array([]) });
    items: any = [];
    fields: string[] = ['', 'Name', 'Description', 'Price'];
    nRows: number = 0;
    subscriptionPicture: any;
    pictures: any[] = [];
    changedPictures: any[] = [];
    @Input() products: any[];
    @Input() rid: string; // restaurant id

    constructor(private rx: NgRedux<IPicture>, private fb: FormBuilder,
        private commerceSvc: CommerceService) { }

    ngOnInit() {
        let nRows = this.products.length;
        let nRowExtras = 5;
        let self = this;

        if (nRows > 0) {
            this.nRows = nRows + 5
            this.generateRows(this.nRows);
            for (let i = 0; i < nRows; i++) {
                this.items.at(i).patchValue(this.products[i]);
            }

            for (let i = 0; i < this.nRows; i++) {
                if (i < nRows && this.products[i].pictures) {
                    this.pictures.push(this.products[i].pictures[0]);
                } else {
                    this.pictures.push({
                        id: 0, name: '',
                        description: '',
                        index: 0,
                        image: { 'data': '', 'file': '' },
                        width: 0,
                        height: 0,
                        product: { id: 0 },
                        status: 'empty'
                    })
                }
            }
        } else {
            this.nRows = 10;
            this.generateRows(this.nRows);
        }


        this.subscriptionPicture = this.rx.select<IPicture[]>('product_pictures').subscribe(
            changedPictures => {
                //self.user = account;
                self.changedPictures = changedPictures;
            })
    }

    ngOnDestroy() {
        this.subscriptionPicture.unsubscribe();
    }

    generateRows(nRows: number) {
        this.items = this.form.get('items') as FormArray;

        for (let i = 0; i < nRows; i++) {
            let fg: FormGroup = new FormGroup({
                id: new FormControl(''),
                name: new FormControl('', [Validators.required, Validators.minLength(3)]),
                description: new FormControl('', [Validators.maxLength(980)]),
                price: new FormControl(''),
                // categories: new FormArray([]),
                restaurant_id: new FormControl(),
                // color_id:new FormControl()
            });

            this.items.push(fg);
        }
    }

    save() {
        let a = [];
        for (let i = 0; i < this.nRows; i++) {
            let p = this.items.at(i).value;
            if (p.name) {
                p.restaurant_id = this.rid;
                p.pictures = this.changedPictures.filter(x => x.product.id == p.id);
                a.push(p);
            }
        }

        // this.commerceSvc.saveMultiProducts(a).subscribe(r => {
        //     let k = r;
        // })

    }

}
