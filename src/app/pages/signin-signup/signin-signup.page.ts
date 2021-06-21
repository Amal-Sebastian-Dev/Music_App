import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-signin-signup',
  templateUrl: './signin-signup.page.html',
  styleUrls: ['./signin-signup.page.scss'],
})
export class SigninSignupPage implements OnInit {

  signup_email: string = null;
  signup_username: string = null;
  signup_pass: string = null;

  signin_username: string = null;
  signin_pass: string = null;

  constructor(
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
  }

  getSignup() {
    document.getElementById('signup-btn').style.bottom = '-100px';
    document.getElementById('login-box').style.left = '-50%'
    document.getElementById('signup-box').style.left = '50%'
    document.getElementById('login-btn').style.bottom = '50px';
  }

  getLogin() {
    document.getElementById('login-btn').style.bottom = '-55px';
    document.getElementById('signup-box').style.left = '150%'
    document.getElementById('login-box').style.left = '50%'
    document.getElementById('signup-btn').style.bottom = '0px';
  }

  async signUp() {

    if (this.signup_username == null || this.signup_username == '') {
      this.presentToast('please provide a username');
    } else if (this.signup_pass.length < 6) {
      this.presentToast('password should be atleast 6 characters');
    } else if (this.signup_email.length < 8) {
      this.presentToast('please provide a proper email');
    } else {
      const loading = await this.loadingCtrl.create();
      await loading.present();

      this.authService.signUp({username: this.signup_username, password: this.signup_pass, email: this.signup_email}).then(user => {
        loading.dismiss();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }, async err => {
        loading.dismiss();
        if (err.code == "auth/email-already-in-use") {
          this.presentAlert('Signup Failed', 'Sorry, this username is already in use by another user.');
        } else if (err.code == "auth/weak-password") {
          this.presentAlert('Signup Failed', 'Password is too short. Please provide atleast 6 characters');
        } else {
          this.presentAlert('Signup Failed', 'Sorry, something went wrong...');
        }

      });
    }
  }

  async signIn() {

    if (this.signin_username == null || this.signin_username == '') {
      this.presentToast('please provide your username');
    } else if (this.signin_pass == null) {
      this.presentToast('please provide your password');
    } else {
      const loading = await this.loadingCtrl.create();
      await loading.present();

      this.authService.signIn({username: this.signin_username, password: this.signin_pass}).then((res) => {
          localStorage.setItem("uid", res.user.uid);
          localStorage.setItem("username", this.signin_username);
          localStorage.setItem('password', this.signin_pass);
          loading.dismiss();
          this.router.navigateByUrl('/home', { replaceUrl: true });
      }, async (err) => {
          loading.dismiss();
          if(err.code == "auth/user-not-found") {
            this.presentAlert(':(', 'Username or password provided is wrong...');
          } else {
            this.presentAlert(':(', 'Sorry something went wrong....');
          }
      });
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
  }

}
