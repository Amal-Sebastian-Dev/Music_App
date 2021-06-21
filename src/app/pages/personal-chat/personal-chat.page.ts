import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonList, IonRange, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { AttachDrawerComponent } from 'src/app/components/attach-drawer/attach-drawer.component';
import { ChatService } from 'src/app/services/chat/chat.service';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Howl } from 'howler';
import { StreamingAudioOptions, StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Subscription } from 'rxjs';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-personal-chat',
  templateUrl: './personal-chat.page.html',
  styleUrls: ['./personal-chat.page.scss'],
})
export class PersonalChatPage {


  name;
  otherUID;
  uid;
  profilePic;
  textMsg: string = '';
  status;
  lastSeenTime;

  chats = [];

  sending = false;

  record = false;
  pause = false;
  path;
  audioFile: MediaObject;
  duration;

  subscription: Subscription;

  //player: Howl = null;
  //@ViewChild('range') range: IonRange;
  //progress = 0;
  //playing = false;

  options: StreamingVideoOptions = {
    successCallback: () => { console.log('Video played') },
    errorCallback: (e) => { this.presentAlert('play error', e) },
    orientation: 'landscape',
    shouldAutoClose: true,
    controls: false
  };

  audioOptions: StreamingAudioOptions = {
    successCallback: () => {  },
    errorCallback: (e) => { this.presentAlert('play error', e) }
  };

  @ViewChild(IonContent) content: IonContent;

  constructor(
    private afStore: AngularFirestore,
    private modalCtrl: ModalController,
    private router: Router,
    private chatService: ChatService,
    private plt: Platform,
    private file: File,
    private media: Media,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private streamingMedia: StreamingMedia,
    private androidPermissions: AndroidPermissions,
    private toastCtrl: ToastController,
    private fileOpener: FileOpener,
    private fileTransfer: FileTransfer,
    private db: AngularFireDatabase
  ) {

    this.otherUID = sessionStorage.getItem('uid_other');
    this.uid = localStorage.getItem('uid');

    this.afStore.collection('users').doc(this.otherUID).valueChanges().subscribe((doc : any) => {
      this.profilePic = doc.profilePic,
      this.name = doc.username
    });

    this.db.object(`status/${this.otherUID}`).valueChanges().subscribe((value: any) => {
      if (value == null) {
        this.status = 'offline';
      } else {
        this.status = value.status;
      }
    });

    this.subscription = this.afStore.collection('users').doc(this.otherUID).collection('lastSeenMessage').doc(this.uid).valueChanges().subscribe((doc) => {
      this.lastSeenTime = doc.time
      console.log(this.lastSeenTime);
      if (this.lastSeenTime <= '06-13-2021, 11:05:22') {
        console.log(true);
      } else {
        console.log(false)
      }
    });

    this.afStore.collection('chats').doc(this.uid).collection(this.otherUID, ref => ref.orderBy('time').limit(30)).valueChanges().subscribe(async (messages) => {
      console.log(messages);
      this.chats = [];

      let lastSeenMsg = null;

      for (let i = 0; i < messages.length; i++) {
        if (messages[i].fileName != null) {
          let type = messages[i].fileName.substring(messages[i].fileName.lastIndexOf('.') + 1);
          if (type == 'pdf') {
            messages[i].fileType = 'file-pdf';
          } else if (type == 'doc' || type == 'docx'){
            messages[i].fileType = 'file-word';
          } else if (type == 'pptx'){
            messages[i].fileType = 'file-powerpoint';
          } else {
            messages[i].fileType = 'file';
          }
        }
        if (messages[i].type == 'audio') {
          messages[i].icon = 'play';
        }
        messages[i].fileDownload = false;
        this.chats.push(messages[i]);

        if (messages[i].sender != this.uid) {
          lastSeenMsg = messages[i];
        }

        if (i == messages.length - 1 && lastSeenMsg != null) {
          this.afStore.collection('users').doc(this.uid).collection('lastSeenMessage').doc(this.otherUID).set({
            time: lastSeenMsg.time,
            msg: lastSeenMsg.textMessage
          });
        }
      }

      /*messages.forEach(msg => {
        if (msg.fileName != null) {
          let type = msg.fileName.substring(msg.fileName.lastIndexOf('.') + 1);
          if (type == 'pdf') {
            msg.fileType = 'file-pdf';
          } else if (type == 'doc' || type == 'docx'){
            msg.fileType = 'file-word';
          } else if (type == 'pptx'){
            msg.fileType = 'file-powerpoint';
          } else {
            msg.fileType = 'file';
          }
        }
        if (msg.type == 'audio') {
          msg.icon = 'play';
        }
        msg.fileDownload = false;
        this.chats.push(msg);
      });*/

    });
  }

  checkStoragePermissionAndroid() {
    return new Promise((resolve, reject) => {
      this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(status => {
        if (status.hasPermission) {
          resolve(true);
        }
        else {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(status => {
            if(status.hasPermission) {
              resolve(true);
            } else {
              resolve(false);
            }
          }).catch(() => {
            resolve(false);
          });
        }
      }).catch(() => {
        resolve(false);
      });
    })
  }

  checkFile(name, path) {
    return new Promise((resolve, reject) => {
      this.file.checkFile(path, name).then((files) => {
        if (files) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(err => resolve(false));
    })
  }

  async openDoc(chat, i) {
    //if (this.plt.is('android')) {
      //if (await this.checkStoragePermissionAndroid()) {
        let path = this.file.externalRootDirectory;
        if (await this.checkFile(chat.fileName, path)) {
          let type = chat.fileName.substring(chat.fileName.lastIndexOf('.') + 1);
          this.fileOpener.showOpenWithDialog(path + chat.fileName, `application/${type}`);
        } else {
          this.chats[i].fileDownload = true;
          const fileTransfer: FileTransferObject = this.fileTransfer.create();
          fileTransfer.download(chat.textMessage, path + chat.fileName).then((entry) => {
            this.chats[i].fileDownload = false;
            let type = chat.fileName.substring(chat.fileName.lastIndexOf('.') + 1);
            this.fileOpener.showOpenWithDialog(path + chat.fileName, `application/${type}`);
          }, (error) => {
            this.presentToast('sorry, there was a problem opening the file');
          });
        }
      //} else {
      //  this.presentToast('Sorry, do not have required permissions');
      //}
    //}

  }

  ionViewWillLeave() {

    this.subscription.unsubscribe();
    //this.player.unload();
  }

  streamVideo(src) {
    this.streamingMedia.playVideo(src, this.options);
  }

  ionViewDidEnter() {

  }



  streamAudio(src) {
    this.streamingMedia.playAudio(src, this.audioOptions);
  }

  async openAttachModal() {
    const modal = await this.modalCtrl.create({
      component: AttachDrawerComponent,
      cssClass: 'attach-drawer-css'
    });

    await modal.present();
  }

  viewProfile() {
    sessionStorage.setItem('uid_other', this.otherUID);
    this.router.navigate(['/other-profile']);
  }

  async sendTextMsg() {

    if (this.record == true) {
      this.pause = true;
      this.record = false;
      const ring = document.getElementById('ring');
      ring.style.animationPlayState = 'paused';
      this.audioFile.stopRecord();
      this.cancelRecord();
      //const loading = await this.loadingCtrl.create();
      //await loading.present();

      await this.chatService.uploadFile(this.path, this.uid, 'audio').then(() => {

        //loading.dismiss()
      }).catch((error) => {
        //loading.dismiss();
        this.presentAlert('send error', error);
      });

    } else if (this.textMsg != null && this.textMsg != '' && this.sending == false) {

      this.sending = true;

      await this.chatService.sendMessage({
        sender: this.uid,
        receiver: this.otherUID,
        msg: this.textMsg,
        msgType: 'text',
        fileName: null
      }).then(() => {
        this.textMsg = "";
        this.sending = false;
        console.log('message send')
      }).catch(() => {
        this.sending = false;
        this.presentToast("sorry, could not send your message.");
      });
    }
  }

  audioRecord() {
    this.record = true;

    if (this.plt.is("android")) {
      this.path = this.file.externalDataDirectory + `/audiofile_${new Date().getTime()}.mp3`;
    } else if (this.plt.is("ios")) {
      this.path = this.file.tempDirectory + `/audiofile_${new Date().getTime()}.m4a`;
    }

    this.audioFile = this.media.create(this.path);

    this.audioFile.startRecord();

    setInterval(() => {
      // get media amplitude
      this.audioFile.getCurrentAmplitude().then((val) => {
        this.duration = val;
      });
    }, 500);


    const recordWindow = document.getElementById('record');
    recordWindow.style.opacity = '1';
    recordWindow.classList.add('grow');
  }

  playPauseRecord() {
    if (this.record == true) {
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
    if (this.record) {
      this.audioFile.stopRecord();
    }
    this.audioFile.release();
    this.record = false;
    this.pause = false;
    const recordWindow = document.getElementById('record');
    recordWindow.style.opacity = '0';
    recordWindow.classList.remove('grow');
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
