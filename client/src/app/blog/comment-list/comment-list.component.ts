import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { Comment } from '../blog';

@Component({
    providers:[BlogService],
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html',
    styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {
    commentList:Comment[];

    fields:string[] = [];
    constructor(private commentServ:BlogService, private router:Router){}

    ngOnInit() {
        let self = this;
        let comment = new Comment()
        this.fields = Object.getOwnPropertyNames(comment);
        this.commentServ.getCommentList().subscribe(
            (r:Comment[]) => {
                self.commentList = r;
            },
            (err:any) => {
                self.commentList = [];
            });
    }

    change(r){this.router.navigate(["admin/comment/" + r.id]);}

    add(){this.router.navigate(["admin/comment"]);}

    delete(r){
        let self = this;
        this.commentServ.rmComment(r.id).subscribe(
            (r:Comment[]) => {
                self.commentList = r;
            },
            (err:any) => {
                self.commentList = [];
            });
    }

}

