import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileEditModalComponent } from '../profile-edit-modal/profile-edit-modal.component';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private popOverCtrl: PopoverController,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  async signout() {
    this.popOverCtrl.dismiss();
    const alert = await this.alertCtrl.create({
      header: "Confirm",
      message: 'Are you sure you want to signout ?',
      buttons: [
        {
          text: 'OKAY',
          handler: async () => {
            const loading = await this.loadingCtrl.create();
            await loading.present();
            this.authService.signOut().then(() => {
              loading.dismiss();
              this.router.navigateByUrl('/signin-signup', { replaceUrl: true });
            });
          }
        },
        'CANCEL'
      ]
    });

    await alert.present();
  }

  async openEditModal() {

    this.popOverCtrl.dismiss();

    const modal = await this.modalCtrl.create({
      component: ProfileEditModalComponent
    });

    await modal.present();
  }

}
