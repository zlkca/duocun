import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
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
