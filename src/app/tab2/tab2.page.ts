import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { faLessThanEqual } from '@fortawesome/free-solid-svg-icons';
import { IonRange } from '@ionic/angular';
import * as AOS from 'aos';
import { Howl } from 'howler';

// To enforce the data types
export interface Posts {
  username: string,
  profilePic: string,
  title: string,
  postId: string,
  url: string,
  heartType: string,
  trackPath: string
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  // Sample array for tracks only
  //  playlist: Track[] = [
  //    {
  //      name: 'Stereo-Hearts',
  //      path: './assets/mp3/Stereo-Hearts.mp3'
  //    }
  //  ];

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

  posts: Posts[] = [
    {
      username: "Edu",
      profilePic: "../../assets/profile.jpg",
      title: "Stereo Hearts",
      postId: "1",
      url: "url of post",
      heartType: 'heart',
      trackPath: './assets/mp3/Stereo-Hearts.mp3'
    },
    {
      username: "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart',
      trackPath: ''
    },
    {
      username: "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart',
      trackPath: ''
    },
    {
      username: "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart',
      trackPath: ''
    },
    {
      username: "user01",
      profilePic: "../../assets/profile.jpg",
      title: "title",
      postId: "1",
      url: "url of post",
      heartType: 'heart',
      trackPath: ''
    },
  ];

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onScroll() {
    AOS.refresh();
  }

  viewProfile() {
    this.router.navigate(['/other-profile']);
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

  player: Howl = null;
  activeTrack: Posts = null;
  isPlaying = false;
  progress = 0;
  @ViewChild('range', { static: false }) range: IonRange;

  start(post) {
    if (this.player) {
      this.player.stop();
    }
    this.player = new Howl({
      src: [post.trackPath],

      onplay: () => {
        this.isPlaying = true;
        this.activeTrack = post;
        this.updateProgress();
      },
      onend: () => {

      }
    });

    this.player.play();
  }

  togglePlayer(pause) {
    this.isPlaying = !pause;
    if (pause) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  seek() {
    let newValue = +this.range.value;
    let duration = this.player.duration();
    this.player.seek(duration * (newValue/100));
  }

  updateProgress() {
    let seek = Number(this.player.seek());
    this.progress = (seek / this.player.duration()) * 100 || 0;
    setTimeout(() => {
      this.updateProgress();
    }, 1000)
  }

  likePost() {

  }

  loadNextPosts() {

  }

}
