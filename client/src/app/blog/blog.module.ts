import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostFormComponent } from './post-form/post-form.component';
import { PostListComponent } from './post-list/post-list.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentFormComponent } from './comment-form/comment-form.component';

import { HttpClientModule, HttpClient } from '@angular/common/http';



@NgModule({
  imports: [
    CommonModule,
      FormsModule,
      RouterModule,
      HttpClientModule
   ],
   exports:[PostListComponent,PostFormComponent,CommentListComponent,CommentFormComponent],
  declarations: [PostFormComponent, PostListComponent, CommentListComponent, CommentFormComponent]
})
export class BlogModule { }
