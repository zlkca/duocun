import { Component, OnInit } from '@angular/core';
import { Mall } from '../../mall/mall.model';
import { MallService } from '../../mall/mall.service';

@Component({
  selector: 'app-admin-mall-page',
  templateUrl: './admin-mall-page.component.html',
  styleUrls: ['./admin-mall-page.component.scss']
})
export class AdminMallPageComponent implements OnInit {

  malls: Mall[] = [];
  mall: Mall;

  constructor(
    private mallSvc: MallService
  ) { }

  ngOnInit() {
    this.loadMallList();
  }

  add() {
    this.mall = new Mall();
    this.mall.id = null;
    this.mall.name = '';
  }

  onAfterSave(event) {
    this.loadMallList();
  }

  onAfterDelete(event) {
    this.loadMallList();

    if (event.mall.id === this.mall.id) {
      this.mall = new Mall();
      this.mall.id = null;
      this.mall.name = '';
    }
  }

  onSelect(event) {
    this.mall = event.mall;
  }

  loadMallList() {
    const self = this;
    this.mallSvc.find().subscribe(
      (r: Mall[]) => {
        self.malls = r;
      },
      (err: any) => {
        self.malls = [];
      });
  }
}

