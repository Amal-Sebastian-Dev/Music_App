import { Component, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, IonRange, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { Howl } from 'howler';
import { PlayerService } from 'src/app/services/player/player.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  uid;

  posts = [];
  loading = true;

  paused = false;
  currPlayingPost = null;
  currPlayingPostIndex = null;
  miniPlayerIcon = "play";

  searchBarEnabled = false;

  player: Howl = null;
  isPlaying = false;
  progress = 0;
  roundedProgress: String = '0';
  @ViewChild('range') range: IonRange;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertCtrl: AlertController,
    private afStore: AngularFirestore,
    private playerService: PlayerService
  ) {
    this.uid = localStorage.getItem('uid');

    this.getLoadingData();

    this.loadPosts();
  }

  enableSearchBar() {
    this.searchBarEnabled = true;
  }

  disableSearchBar() {
    this.searchBarEnabled = false;
  }

  searching(ev) {
    console.log('searching');
  }

  ngOnInit() {
  }

  getLoadingData() {
    this.playerService.getloadingObservable().subscribe((data) => {
      this.posts[data.index].loading = data.value;
    });
  }

  ionViewWillLeave() {

    if (this.player != null) {
      this.player.unload()
    }

  }

  loadPosts() {
    this.afStore.collection('posts', ref => ref.orderBy('createdAt', 'desc')).valueChanges().subscribe((doc: any) => {
      this.posts = [];
      doc.forEach(element => {

        element.playing = false;
        element.paused = false;
        element.loading = false;

        this.afStore.collection('posts').doc(element.postID).collection('likes').valueChanges().subscribe((likes) => {
          element.likes = likes.length;
          element.heartType = 'heart-outline';

          if (likes.length > 0) {
            let found = likes.some(like => like.authorID === this.uid);
            if (found) {
              element.heartType = 'heart';
            }
          }
        });

        this.afStore.collection('posts').doc(element.postID).collection('comments').valueChanges().subscribe((comments) => {
          element.comments = comments.length;
        });
        //element.comments = 0;
        this.posts.push(element);
      });

      this.loading = false;
    });
  }

  likeOrDislike(post) {
    if (post.heartType == 'heart-outline') {
      this.afStore.collection('posts').doc(post.postID).collection('likes').doc(this.uid).set({
        authorID: this.uid,
        likedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    } else if (post.heartType == 'heart') {
      this.afStore.collection('posts').doc(post.postID).collection('likes').doc(this.uid).delete();
    }

  }


  cancelAudioLoad() {
    this.playerService.publishCancelData({
      cancel: true
    });

    this.posts[this.currPlayingPostIndex].loading = false;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  sideButtons() {
    const topBtn = document.getElementById("top-btn");
    const sideBtns = document.getElementsByClassName("side-btn");
    if (topBtn.style.transform == "rotateZ(90deg)") {
      topBtn.style.transform = "rotateZ(0deg)";
      for (let i = 0; i < sideBtns.length; i++) {
        const btn = sideBtns[i] as HTMLElement;
        btn.style.left = "-50px";
      }
    } else {
      topBtn.style.transform = "rotateZ(90deg)";
      for (let i = 0; i < sideBtns.length; i++) {
        const btn = sideBtns[i] as HTMLElement;
        btn.style.left = "10px";
      }
    }
  }

  uploadPage() {
    document.getElementById("upload-btn").style.color = "white";
    document.getElementById("upload-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/upload']);
  }

  chatsPage() {
    document.getElementById("chat-btn").style.color = "white";
    document.getElementById("chat-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/chats']);
  }

  profilePage() {
    document.getElementById("profile-btn").style.color = "white";
    document.getElementById("profile-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/own-profile']);
  }

  tvPage() {
    document.getElementById("tv-btn").style.color = "white";
    document.getElementById("tv-btn").style.background = "#4facfe";
  }

  viewOtherProfile(otherID) {
    if (otherID != this.uid) {
      sessionStorage.setItem('uid_other', otherID);
      this.router.navigate(['/other-profile']);
    }
  }

  playAudio(post, i) {
    this.playerService.publishSomeData({
      song: post.url,
      index: i,
      songName: post.name,
      authorName: post.authorName,
      pic: post.pic
    });

    this.currPlayingPostIndex = i;

    this.posts[i].loading = true;
  }

  async openComments(id) {
    sessionStorage.setItem('postID', id);
    this.router.navigate(['/comments']);
  }

}
