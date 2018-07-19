import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { Post } from '../blog';

@Component({
    providers:[BlogService],
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
    postList:Post[];

    fields:string[] = [];
    constructor(private postServ:BlogService, private router:Router){}

    ngOnInit() {
        let self = this;
        let post = new Post()
        this.fields = Object.getOwnPropertyNames(post);
        this.postServ.getPostList().subscribe(
            (r:Post[]) => {
                self.postList = r;
            },
            (err:any) => {
                self.postList = [];
            });
    }

    change(r){this.router.navigate(["admin/post/" + r.id]);}

    add(){this.router.navigate(["admin/post" ]);}

    delete(r){
        let self = this;
        this.postServ.rmPost(r.id).subscribe(
            (r:Post[]) => {
                self.postList = r;
            },
            (err:any) => {
                self.postList = [];
            });
    }

}

