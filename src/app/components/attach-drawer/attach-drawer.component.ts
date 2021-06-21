import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
//import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { CaptureImageOptions, CaptureVideoOptions, MediaCapture } from '@ionic-native/media-capture/ngx';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ViewPhotoComponent } from '../view-photo/view-photo.component';

@Component({
  selector: 'app-attach-drawer',
  templateUrl: './attach-drawer.component.html',
  styleUrls: ['./attach-drawer.component.scss'],
})
export class AttachDrawerComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private alertCtrl: AlertController,
    private afStorage: AngularFireStorage,
    private chatService: ChatService,
    private loadingCtrl: LoadingController,
    private mediaCapture: MediaCapture,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}


  selectFile(fileType: string) {
    let filter = { "mime": fileType };

    this.fileChooser.open(filter).then(uri => {
      this.filePath.resolveNativePath(uri).then(async resolvedPath => {
        let type = fileType.substring(0, fileType.indexOf('/'));
        if (type == 'image') {
          this.openViewPhotoModal(resolvedPath);
        } else {
          const loading = await this.loadingCtrl.create();
          await loading.present();

          let uid = localStorage.getItem("uid");

          await this.chatService.uploadFile(resolvedPath, uid, type).then(() => {
            loading.dismiss();
          }).catch(() => {
            loading.dismiss();
          });
        }
      });
    });
  }

  async takePhoto() {

    let uid = localStorage.getItem("uid");

    let options: CaptureImageOptions = {
      limit: 1,
    }

    this.mediaCapture.captureImage(options).then(async (file) => {

      const loading = await this.loadingCtrl.create();
      await loading.present();

      await this.chatService.uploadFile(file[0].fullPath, uid, 'image').then(() => {
        loading.dismiss();
      }).catch((error) => {
        loading.dismiss();
      });
    });
  }

  async takeVideo() {
    let uid = localStorage.getItem("uid");

    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 180,
      quality: 100,
    }

    this.mediaCapture.captureVideo(options).then(async (file) => {
      const loading = await this.loadingCtrl.create();
      await loading.present();

      await this.chatService.uploadFile(file[0].fullPath, uid, 'video').then(() => {
        loading.dismiss();
      }).catch(() => {
        loading.dismiss();
      });
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

  async openViewPhotoModal(path) {
    const modal = await this.modalCtrl.create({
      component: ViewPhotoComponent,
      componentProps: {
        path: path
      }
    });

    await modal.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
  }

}
