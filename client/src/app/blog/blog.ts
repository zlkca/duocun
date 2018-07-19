
export class Post{
  public id:string;
  public title:string;
  public body:string;
  public author:any = {id:1};
  public created:string;
  public updated:string;
    constructor(o?:any){
        if(o){
        	this.id = o.id;
            this.title = o.title;
            this.body = o.body;
            if(o.author){
                this.author = o.author;
            }
            this.created = o.created;
            this.updated = o.updated;
      }
  }
}

export class Comment{
  public id:string;
  public body:string;
  public author:any = {id:1};
  public post:any = {id:1};
  public created:string;
  public updated:string;
    constructor(o?:any){
        if(o){
        	this.id = o.id;
            this.body = o.body;
            if(o.author){
                this.author = o.author;
            }
            if(o.post){
                this.post = o.post;
            }
            this.created = o.created;
            this.updated = o.updated;
      }
  }
}