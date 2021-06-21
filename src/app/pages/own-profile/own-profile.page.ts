import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { AlertController, IonRange, NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { Howl } from 'howler';
import { Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player/player.service';

@Component({
  selector: 'app-own-profile',
  templateUrl: './own-profile.page.html',
  styleUrls: ['./own-profile.page.scss'],
})
export class OwnProfilePage implements OnInit {

  profilePic = null;

  uid;
  username = ' ';
  bio = null;
  subscribers: number;
  subscribing: number;

  uploadTask: AngularFireUploadTask;
  posts = [];

  player: Howl = null;
  //isPlaying = false;
  progress = 0;
  roundedProgress: String = '0';
  @ViewChild('range') range: IonRange;
  paused = false;
  currPlayingPost = null;
  currPlayingPostIndex = null;
  miniPlayerIcon = "play";


  constructor(
    private navCtrl: NavController,
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private afStore: AngularFirestore,
    private router: Router,
    private playerService: PlayerService
  ) {
    this.getLoadingData();
  }

  getLoadingData() {
    this.playerService.getloadingObservable().subscribe((data) => {
      this.posts[data.index].loading = data.value;
    });
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.uid = localStorage.getItem('uid');
    this.afStore.collection('users').doc(this.uid).valueChanges().subscribe((doc: any) => {
      this.username = doc.username;
      this.profilePic = doc.profilePic;
      this.bio = doc.bio;
    });

    this.afStore.collection('users').doc(this.uid).collection('subscribers').valueChanges().subscribe((subscribers) => {
      this.subscribers = subscribers.length;
    });

    this.afStore.collection('users').doc(this.uid).collection('subscribing').valueChanges().subscribe((subscribing) => {
      this.subscribing = subscribing.length;
    });

    this.loadPosts();
  }

  ionViewDidEnter() {

  }

  ionViewWillLeave() {

    if (this.player != null) {
      this.player.unload()
    }

  }

  loadPosts() {
    this.afStore.collection('posts', ref => ref.where('authorID', '==', this.uid).orderBy('createdAt', 'desc')).valueChanges().subscribe((docs: any) => {
      this.posts = [];
      docs.forEach(doc => {
        doc.playing = false;
        doc.paused = false;
        doc.loading = false;

        this.afStore.collection('posts').doc(doc.postID).collection('likes').valueChanges().subscribe((likes) => {
          doc.likes = likes.length;
        });

        this.afStore.collection('posts').doc(doc.postID).collection('comments').get().subscribe((comments) => {
          doc.comments = comments.size;
        });

        this.posts.push(doc);
      });
    });
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

  homePage() {
    document.getElementById("home-btn").style.color = "white";
    document.getElementById("home-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/home']);
  }

  tvPage() {
    document.getElementById("tv-btn").style.color = "white";
    document.getElementById("tv-btn").style.background = "#4facfe";
  }

  cancelAudioLoad() {

    this.playerService.publishCancelData({
      cancel: true
    });

    this.posts[this.currPlayingPostIndex].loading = false;

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

  listUsers(collection) {
    if (collection == 'subscribers') {
      if (this.subscribers > 0) {
        sessionStorage.setItem('collection', collection);
        sessionStorage.setItem('otherUID', this.uid);
        this.router.navigate(['/users-list']);
      }
    } else if (collection == 'subscribing') {
      if (this.subscribing > 0) {
        sessionStorage.setItem('collection', collection);
        sessionStorage.setItem('otherUID', this.uid);
        this.router.navigate(['/users-list']);
      }
    }
  }

  async presentPopover(event) {

    sessionStorage.setItem('profilePic', this.profilePic);
    sessionStorage.setItem('username', this.username);
    if (this.bio == null) {
      sessionStorage.setItem('bio', ' ');
    } else {
      sessionStorage.setItem('bio', this.bio);
    }


    const popover = await this.popOverCtrl.create({
      component: PopoverComponent,
      componentProps: [

      ],
      cssClass: 'popOver',
      event: event,
      translucent: true
    });
    await popover.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
