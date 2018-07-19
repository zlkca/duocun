import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

	form:FormGroup = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.minLength(3)]),
	});
		get name(){
		return this.form.get('name');
	}
  constructor() { }

  ngOnInit() {
  }

}
