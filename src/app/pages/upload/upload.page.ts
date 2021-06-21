import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { Base64 } from '@ionic-native/base64/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { AlertController, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { PlayerModalComponent } from 'src/app/components/player-modal/player-modal.component';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {

  @ViewChild('audioInput') imgInputBtn;

  uid;

  files = [];

  audioFile: MediaObject;
  path;
  recording = false;
  duration = '00:00';
  pause = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private file: File,
    private media: Media,
    private afStorage: AngularFireStorage,
    private plt: Platform,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private base64: Base64,
    private loadingCtrl: LoadingController,
    private afstore: AngularFirestore
  ) {
    this.uid = localStorage.getItem('uid');
  }

  ngOnInit() {

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

  homePage() {
    document.getElementById("upload-btn").style.color = "white";
    document.getElementById("upload-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/home']);
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

  viewOtherProfile() {
    this.router.navigate(['/other-profile']);
  }

  async selectAudio() {

    let filter = { "mime": "audio/*" };

    this.fileChooser.open(filter).then(uri => {
      this.filePath.resolveNativePath(uri).then(resolvedPath => {
        this.openPlayerModal(resolvedPath);
      })
    })
  }


  captureAudio() {



    if (this.plt.is("android")) {
      this.path = this.file.externalDataDirectory + `/audiofile_${new Date().getTime()}.mp3`;
    } else if (this.plt.is("ios")) {
      this.path = this.file.tempDirectory + `/audiofile_${new Date().getTime()}.m4a`;
    }

    this.audioFile = this.media.create(this.path);

    this.audioFile.startRecord();

    this.recording = true;

    const recordWindow = document.getElementById('record');
    recordWindow.style.opacity = '1';
    recordWindow.classList.add('grow');
  }

  playPauseRecord() {
    if (this.recording == true) {
      const ring = document.getElementById('ring');
      if (this.pause) {
        this.audioFile.resumeRecord();
        ring.style.animationPlayState = 'running';
        this.pause = false;
      } else {
        this.audioFile.pauseRecord();
        ring.style.animationPlayState = 'paused';
        this.pause = true;
      }
    }
  }


  cancelRecord() {
    if (this.recording) {
      this.audioFile.stopRecord();
    }
    this.audioFile.release();
    this.pause = false;
    const recordWindow = document.getElementById('record');
    recordWindow.style.opacity = '0';
    recordWindow.classList.remove('grow');

    this.recording = false;
  }


  stopRecord() {

    const recordWindow = document.getElementById('record');
    recordWindow.style.opacity = '0';
    recordWindow.classList.remove('grow');

    this.recording = false;
    this.pause = false;

    this.audioFile.stopRecord();

    this.openPlayerModal(this.path);
  }


  async openPlayerModal(path) {
    const modal = await this.modalCtrl.create({
      component: PlayerModalComponent,
      componentProps: {
        path: path
      }
    });

    return await modal.present();
  }


  async uploadFile(path, name) {

    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.base64.encodeFile(path).then(async (base64) => {

      let ext = name.substr(name.lastIndexOf('.') + 1);

      let messageSplit = base64.split('data:image/*;charset=utf-8;base64,')[1];

      const filePath = `user_${ new Date().getTime() }.${ext}`;
      let task = this.afStorage.ref(filePath).putString(messageSplit, 'base64');

      task.task.snapshot.ref.getDownloadURL

      task.then(() => {

        task.task.snapshot.ref.getDownloadURL().then((downloadUrl) => {

          let postID = this.afstore.createId()

          this.afstore.collection('posts').doc(postID).set({
            authorID: this.uid,
            createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
            url: downloadUrl,
            postID: postID,
          }).then(() => {
            loading.dismiss();
            this.presentAlert('Upload success', 'uploading finished !!!!!');
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
