import { Post } from '../posts/post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, subscribeOn } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Injectable({providedIn:'root'})
export class PostsService{

  private posts: Post[]=[];
  private postUpdated= new Subject<Post[]>();

  constructor(private http: HttpClient){

  }

  getPost(id: string){
    return this.http.get<{_id: string, title: string, content: string}>(
      'http://localhost:3000/api/posts/'+id
      );
  }
  updatePost(id: string,title: string,content: string){
    const post: Post={ id:id, title:title, content:content}
    this.http.put('http://localhost:3000/api/posts/'+id,post)
    .subscribe(response=>{
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p=>p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postUpdated.next([...this.posts]);
    })
  }
  getPosts(){
    this.http.get<{ message:string, posts:any}>('http://localhost:3000/api/posts')
    .pipe( map((postData)=>{
      return postData.posts.map(post=>{
        return{
          id: post._id,
          title: post.title,
          content: post.content
        }
      })
    }))
    .subscribe( (postData) => {
      this.posts = postData;
      this.postUpdated.next([...this.posts]);

    });
  }

  getPostUpdateListener(){
    return this.postUpdated.asObservable();
  }

  addPost(title, content){
    const post= { id: null,  title:title, content:content }
    this.http.post<{message: string, postId: string, }>('http://localhost:3000/api/posts',post)
    .subscribe(responseData=>{
       const id = responseData.postId
       post.id = id;
       this.posts.push(post);
       this.postUpdated.next([...this.posts]);
    });
  }
  deletePost(postId: string){

    this.http.delete('http://localhost:3000/api/posts/'+postId)
    .subscribe(()=>{
      const updatedPost = this.posts.filter(post=> post.id!==postId);
      this.posts= updatedPost;
      this.postUpdated.next([...this.posts]);
    })
  }

}