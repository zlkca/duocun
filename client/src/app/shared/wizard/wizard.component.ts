import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit {

    @Input('items') items:any[] = [];

    constructor() { }

    ngOnInit() {
    }

    onClick(item:any){
        for(var i = 0; i< this.items.length; i++){
            if(i <= item.id){
                this.items[i].status = 'active';
            }else{
                this.items[i].status = 'inactive';
            }

            this.items[i].selected = (i == item.id);
        }

    }

}
