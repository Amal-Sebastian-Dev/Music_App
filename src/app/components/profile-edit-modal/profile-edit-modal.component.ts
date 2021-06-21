import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
})
export class ProfileEditModalComponent implements OnInit {

  @ViewChild('imgInput') imgInputBtn;

  profilePic = null;
  username;
  newUsername = null;
  bio = '';
  uid;
  selectedImg = null;
  duplicateUsername = false;

  uploadTask: AngularFireUploadTask;
  loading;
  picURL = null;
  uploadError = false;
  usernameUpdateError = false;

  user: firebase.default.User;

  constructor(
    private modalCtrl: ModalController,
    private afStorage: AngularFireStorage,
    private afStore: AngularFirestore,
    private sanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
  ) {
    this.uid = localStorage.getItem('uid');
    this.username = this.newUsername = sessionStorage.getItem('username');
    this.picURL = this.profilePic = sessionStorage.getItem('profilePic');
    this.bio = sessionStorage.getItem('bio');

    console.log(this.profilePic);
  }

  ngOnInit() {}

  dismissModal() {
    this.modalCtrl.dismiss();
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

  async updateProfile() {

    if (this.newUsername == null || this.newUsername == '') {
      this.presentToast('username cannot be empty');
    } else {

      this.loading = await this.loadingCtrl.create({
      });
      await this.loading.present();

      if (this.selectedImg != null) {
        let result = await this.uploadProfilePic();
      }

      if (this.uploadError == false) {
        if (this.bio == ' ') {
          this.bio = null;
        }

        if (this.username != this.newUsername) {
          if (this.duplicateUsername == false) {
            this.user = await this.afAuth.currentUser;
            let password = localStorage.getItem('password');
            const credential = firebase.default.auth.EmailAuthProvider.credential(this.user.email, password);
            await this.user.reauthenticateWithCredential(credential);
            let res = await this.updateUsername(this.newUsername);
          } else {
            this.loadingCtrl.dismiss();
            this.presentAlert('Error', 'Username not available. Please choose another');
            this.usernameUpdateError = true;
          }
        }

        if (this.usernameUpdateError == false) {
          this.afStore.collection("users").doc(this.uid).update({
            profilePic: this.picURL,
            username: this.newUsername,
            bio: this.bio
          }).then(() => {
            console.log("upload Successfull");
            this.loading.dismiss();
            this.modalCtrl.dismiss();
          }).catch((error) => {
            this.loading.dismiss();
            this.presentAlert('Error', error);
          });
        }
      }

    }
  }

  checkIfUsernameExists(username) {
    if (username != this.username) {
      this.afAuth.fetchSignInMethodsForEmail(username + "@musicapp.com").then((task) => {
        if (task.length == 1) {
          this.duplicateUsername = true;
          this.presentToast('Username not available. Please choose another');
        } else {
          console.log('available');
          this.duplicateUsername = false;
        }
      })
    }
  }

  updateUsername(username) {
    return new Promise((resolve, reject) => {
      this.user.updateEmail(username + '@musicapp.com').then(() => {
        console.log('email updated!');
        resolve('done');
      }).catch((error) => {
        this.usernameUpdateError = true;
        this.loadingCtrl.dismiss();
        this.presentAlert('Error', 'Sorry somthing went wrong. Try again later...');
        console.log('email update error ', error);
        reject(error);
      });
    })
  }

  async uploadProfilePic() {
    return new Promise((resolve, reject) => {
      let fName = this.username + "_" + new Date().getTime();
      let path = `profilePhotos/${fName}`;

      this.uploadTask = this.afStorage.upload(path, this.selectedImg);

      this.uploadTask.percentageChanges().subscribe((snapshot) => {
        console.log("uploading ", snapshot);
      }, (error) => {
        console.dir(error);
        this.uploadError = true;
        this.loading.dismiss();
        this.presentAlert('Uploading Error', error);
        resolve('error');
      }, () => {
        console.log('upload success!!!!');
        this.uploadTask.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
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
