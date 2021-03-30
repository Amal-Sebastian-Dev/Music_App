import { Component } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  option = {
    slidesPerView: 1.5,
    centeredSlides: true,
    spaceBetween: 10,
  };

  tags = [
    "Pop",
    "Melody",
    "Rock",
    "Funk"
  ];

  posts = [
    {
      username : "Username",
      profilePic: "../../assets/profile.jpg",
      title: "Song Title",
      postId: "1",
      url: "url of post",
      heartType: 'heart'
    },
    {
      username : "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart'
    },
    {
      username : "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart'
    },
    {
      username : "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart'
    },
    {
      username : "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart'
    },
  ];

  constructor() {}

  ngOnInit() {
  }

  onScroll() {
    AOS.refresh();
  }

  tagsAnim(event, tag) {
    //this.selectedTag = tag;

    if (!event.target.classList.contains("active")) {

      const scroll = document.getElementById("scroll");
      let children = scroll.children;
      for (let i = 0; i < children.length; i++) {
        console.log("children");
        children[i].classList.remove("active");
      }
      event.target.classList.add("active");
      //if(tag == "Most Liked") {
      //  this.posts.length = 0;
      //  this.posts.pop();
      //  this.loadMostLikedPosts();
      //} else {
      //  this.posts = [];
      //  this.loadPostWithTags(tag);
      //}

    } else {
      event.target.classList.remove("active");
      //this.selectedTag = null;
      //this.posts = [];
      //this.loadPosts();
    }
  }

  playAudio() {

  }

  resumeAudio() {

  }

  likePost() {

  }

  pauseAudio() {

  }

  loadNextPosts() {

  }

}
