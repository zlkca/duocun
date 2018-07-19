import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogService } from '../blog.service';
import { Post } from '../blog';

@Component({
    providers:[BlogService],
    selector: 'app-post-form',
    templateUrl: './post-form.component.html',
    styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
    post:Post = new Post();

    id:string;
    constructor(private postServ:BlogService, private route: ActivatedRoute){}

    ngOnInit() {
        let self = this;
        self.route.params.subscribe((params:any)=>{
           if(params.id){
               self.id = params.id;
               this.postServ.getPost(params.id).subscribe(
                   (r:Post) => {
                    self.post = r;
                   },
                   (err:any) => {
                    self.post = new Post();
                   });
           }else{
               self.post = new Post();
           }
        });
    }

    save() {
       let self = this;
       self.post.id = self.id;
       self.postServ.savePost(self.post).subscribe(
            (r:Post) => {
                self.post = r;
            },
            (err:any) => {
                self.post = new Post();
            });
    }
}

