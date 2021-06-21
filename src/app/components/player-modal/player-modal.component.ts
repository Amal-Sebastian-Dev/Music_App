import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { AlertController, LoadingController, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.scss'],
})
export class PlayerModalComponent implements OnInit {

  uid: string;
  username: string;
  path: string;

  audio: MediaObject = null;
  playIcon: string = 'pause';
  audioDuration: number;
  currentPosition: number;
  restTime: string;

  tags = [
    'pop',
    'melody',
    'hiphop',
    'rap',
    'ambient',
    'nature',
    'love',
    'inspirational',
    'rock',
    'k-pop',
    'classical',
    'jazz',
    'heavy metal',
    'country'
  ];

  slideOptions = {
    slidesPerView: 5,
      freeMode: true,
  };


  filters = [
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    },
    {
      name: 'effect1'
    }
  ];

  selectedTags = null;
  songName: String = null;

  @ViewChild('imgInput') imgInputBtn;
  profilePic = null;
  selectedImg = null;

  uploadError = false;
  picURL = null;

  constructor(
    private modalCtrl: ModalController,
    private media: Media,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private afStorage: AngularFireStorage,
    private base64: Base64,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private afstore: AngularFirestore,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer,
  ) {
    this.uid = localStorage.getItem('uid');
    this.username = localStorage.getItem('username');
    this.path = this.navParams.get('path');
  }

  ngOnInit() {

  }

  ionViewWillLeave() {

    if (this.audio != null) {
      this.audio.release()
    }

  }

  ionViewDidEnter() {
    this.readAudio();
  }

  checkTagSelection() {
    if (this.selectedTags.length > 3) {
      this.selectedTags = null;
      this.presentToast("Maximum three tags only allowed")
    }
  }

  selectImg() {
    this.imgInputBtn.nativeElement.click();
  }

  loadImg(event) {
    if(event.target.files.length > 0){
      let src = URL.createObjectURL(event.target.files[0]);
      this.profilePic = this.sanitizer.bypassSecurityTrustUrl(src);
      this.selectedImg = event.target.files[0];
    }
  }

  readAudio() {
    this.audio = this.media.create(this.path);
    this.audio.onStatusUpdate.subscribe(status => {
      console.log(status);
      if (status.toString() == '4') {
        this.presentAlert('complete', 'audio playing completed');
      }
    });
    this.audio.onSuccess.subscribe(() => console.log('Success'));
    this.audio.onError.subscribe(error => this.presentAlert('Error', error.toString()));
    this.audio.play();

    setInterval(() => {
      this.audio.getCurrentPosition().then((position) => {
        this.audioDuration = Math.floor(this.audio.getDuration());
        this.currentPosition = Math.floor(position);
        this.convertSec(this.audioDuration - this.currentPosition);
      });
    }, 250);
  }

  convertSec(seconds: number) {
    const min = Math.floor((seconds/60/60)*60);
    const sec = Math.floor(((seconds/60/60)*60 - min)*60);
    this.restTime = min + 'm' + sec + 's';
  }

  playPause() {
    if (this.playIcon == 'pause') {
      this.playIcon = 'play';
      this.audio.pause();
    } else {
      this.playIcon = 'pause';
      this.audio.play();
    }
  }

  changePosition() {
    this.audio.seekTo(this.currentPosition*1000);
    this.convertSec(this.audioDuration - this.currentPosition);
  }


  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async uploadFile() {

    if (this.songName == null || this.songName == " ") {
      this.presentToast("Please give a name");
    } else if (this.selectedTags.length <= 0 || this.selectedTags.length == null) {
      this.presentToast("Please select some tags");
    } else if (this.selectedImg == null) {
      this.presentToast("Please select a image");
    } else {

      const loading = await this.loadingCtrl.create();
      await loading.present();

      let result = await this.uploadProfilePic();

      if (this.uploadError == false) {

        this.base64.encodeFile(this.path).then(async (base64) => {

          let name = this.path.substr(this.path.lastIndexOf('/') + 1);

          let ext = name.substr(name.lastIndexOf('.') + 1);

          let messageSplit = base64.split('data:image/*;charset=utf-8;base64,')[1];

          const filePath = `posts/post/user_${this.uid}_${ new Date().getTime() }.${ext}`;
          let task = this.afStorage.ref(filePath).putString(messageSplit, 'base64');

          task.task.snapshot.ref.getDownloadURL

          task.then(() => {

            task.task.snapshot.ref.getDownloadURL().then((downloadUrl) => {

              let postID = this.afstore.createId()

              this.afstore.collection('posts').doc(postID).set({
                authorID: this.uid,
                authorName: this.username,
                createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
                url: downloadUrl,
                postID: postID,
                name: this.songName,
                tags: this.selectedTags,
                pic: this.picURL
              }).then(() => {
                this.modalCtrl.dismiss();
                loading.dismiss();
                this.navCtrl.navigateRoot(['/own-profile']);
                //this.presentAlert('Upload success', 'uploading finished !!!!!');
              });

            }).catch((error) => {
              loading.dismiss();
              this.presentAlert('URL Error', error);
            });

          });

          task.catch((error) => {
            loading.dismiss();
            this.presentAlert('Upload Error', error.toString())
          });

        }).catch(error => {
          loading.dismiss();
          this.presentAlert('base64 error', error);
          console.error(error);
        });

      }
    }
  }

  async uploadProfilePic() {
    return new Promise((resolve, reject) => {
      let fName = this.uid + "_" + new Date().getTime();
      let path = `posts/postPics/${fName}`;

      const uploadTask = this.afStorage.upload(path, this.selectedImg);

      uploadTask.percentageChanges().subscribe((snapshot) => {
        console.log("uploading ", snapshot);
      }, (error) => {
        console.dir(error);
        this.uploadError = true;
        this.loadingCtrl.dismiss();
        this.presentAlert('Uploading Error', error);
        resolve('error');
      }, () => {
        console.log('upload success!!!!');
        uploadTask.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
          this.picURL = downloadURL;
          resolve('success');
        });
      });
    })
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
  }

}
