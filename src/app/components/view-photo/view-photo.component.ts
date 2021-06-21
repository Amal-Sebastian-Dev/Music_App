import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-view-photo',
  templateUrl: './view-photo.component.html',
  styleUrls: ['./view-photo.component.scss'],
})
export class ViewPhotoComponent implements OnInit {

  path;
  sending = false;

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private chatService: ChatService,
    //private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    this.path = this.navParams.get('path');
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async sendImageFile() {
    //const loading = await this.loadingCtrl.create();
    //await loading.present();

    this.sending = true;

    let uid = localStorage.getItem("uid");
    await this.chatService.uploadFile(this.path, uid, 'image').then(() => {
      this.sending = false;
      //loading.dismiss();
      this.dismiss();
    }).catch((error) => {
      this.sending = false;
      //loading.dismiss();
      this.presentToast('Cannot send file. Please try again...');
      this.presentAlert('send error', error);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
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
