import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, IonRange, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { Howl } from 'howler';
import { PlayerService } from 'src/app/services/player/player.service';

@Component({
  selector: 'app-other-profile',
  templateUrl: './other-profile.page.html',
  styleUrls: ['./other-profile.page.scss'],
})
export class OtherProfilePage implements OnInit {

  otherUid;
  profilePic = null;
  username;
  subscribers;
  subscribing;

  uid;
  subscribed;

  posts = [];

  player: Howl = null;
  progress = 0;
  roundedProgress: String = '0';
  @ViewChild('range') range: IonRange;
  paused = false;
  currPlayingPost = null;
  currPlayingPostIndex = null;
  miniPlayerIcon = "play";

  constructor(
    private afStore: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private playerService: PlayerService,
  ) {
    this.getLoadingData();
  }

  getLoadingData() {
    this.playerService.getloadingObservable().subscribe((data) => {
      this.posts[data.index].loading = data.value;
    });
  }

  ngOnInit() {

    this.otherUid = sessionStorage.getItem('uid_other');
    this.uid = localStorage.getItem('uid');

    this.afStore.collection('users').doc(this.otherUid).valueChanges().subscribe((doc: any) => {
      this.profilePic = doc.profilePic,
      this.username = doc.username
    });

    this.afStore.collection('users').doc(this.otherUid).collection('subscribers').valueChanges().subscribe((subscribers) => {
      this.subscribers = subscribers.length;
    });

    this.afStore.collection('users').doc(this.otherUid).collection('subscribing').valueChanges().subscribe((subscribing) => {
      this.subscribing = subscribing.length;
    });

    this.afStore.collection('users').doc(this.uid).collection('subscribing').valueChanges().subscribe((subscribing) => {
      let found = subscribing.some(user => user.userID === this.otherUid);
      if (found) {
        this.subscribed = true;
      } else {
        this.subscribed = false;
      }
    });

    this.loadPosts();
  }

  loadPosts() {
    this.afStore.collection('posts', ref => ref.where('authorID', '==', this.otherUid).orderBy('createdAt', 'desc')).valueChanges().subscribe((docs: any) => {
      this.posts = [];
      docs.forEach(doc => {
        doc.playing = false;
        doc.paused = false;
        doc.loading = false;

        this.afStore.collection('posts').doc(doc.postID).collection('likes').valueChanges().subscribe((likes) => {
          doc.likes = likes.length;
          doc.heartType = 'heart-outline';

          if (likes.length > 0) {
            let found = likes.some(like => like.authorID === this.otherUid);
            if (found) {
              doc.heartType = 'heart';
            }
          }
        });

        this.afStore.collection('posts').doc(doc.postID).collection('comments').get().subscribe((comments) => {
          doc.comments = comments.size;
        });

        this.posts.push(doc);
      });
    });
  }

  async subscribeAndUnsubscribe(subscribed) {

    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
    });
    await loading.present();

    if (subscribed) {

      this.afStore.collection('users').doc(this.uid).collection('subscribing').doc(this.otherUid).delete().then(() => {
        this.afStore.collection('users').doc(this.otherUid).collection('subscribers').doc(this.uid).delete().then(() => {
          loading.dismiss();
        }).catch((error) => {
          loading.dismiss();
          this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
          //this.subscribed = false;
        });
      }).catch((error) => {
        loading.dismiss();
        this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
      });

    } else {

      this.afStore.collection('users').doc(this.otherUid).collection('subscribers').doc(this.uid).set({
        authorID: this.uid,
        subscribedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.afStore.collection('users').doc(this.uid).collection('subscribing').doc(this.otherUid).set({
          userID: this.otherUid,
          subscribedAt: firebase.default.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          loading.dismiss();
          //this.subscribed = true;
        }).catch((error) => {
          loading.dismiss();
          this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
        });
      }).catch((error) => {
        loading.dismiss();
        this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
      });

    }
  }

  likeOrDislike(post) {
    if (post.heartType == 'heart-outline') {
      this.afStore.collection('posts').doc(post.postID).collection('likes').doc(this.otherUid).set({
        authorID: this.otherUid,
        likedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    } else if (post.heartType == 'heart') {
      this.afStore.collection('posts').doc(post.postID).collection('likes').doc(this.otherUid).delete();
    }

  }

  goToChat() {
    sessionStorage.setItem("uid_other", this.otherUid);
    this.router.navigate(['/personal-chat']);
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
        sessionStorage.setItem('otherUID', this.otherUid);
        this.router.navigate(['/users-list']);
      }
    } else if (collection == 'subscribing') {
      if (this.subscribing > 0) {
        sessionStorage.setItem('collection', collection);
        sessionStorage.setItem('otherUID', this.otherUid);
        this.router.navigate(['/users-list']);
      }
    }
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
