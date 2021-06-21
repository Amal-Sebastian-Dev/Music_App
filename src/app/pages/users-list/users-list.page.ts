import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
})
export class UsersListPage implements OnInit {

  users = [];
  otherUID;
  uid;

  moreUsers = 20;
  moreUsersAvailable = false;

  subcollection;

  constructor(
    private afStore: AngularFirestore,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) {

    this.subcollection = sessionStorage.getItem('collection');
    this.otherUID = sessionStorage.getItem('otherUID');
    this.uid = localStorage.getItem('uid');

    if (this.subcollection == 'subscribing') {
      this.loadSubscribingUsers(this.subcollection);
    } else if (this.subcollection == 'subscribers') {
      this.loadSubscribers(this.subcollection);
    }

  }

  ngOnInit() {
  }

  loadSubscribers(collection) {
    this.afStore.collection('users').doc(this.otherUID).collection(collection, ref => ref.orderBy('subscribedAt', 'desc').limit(20)).get().subscribe((users) => {
      users.docs.forEach(doc => {
        let user = {username: '', profilePic: '', uid: '', subscribed: true};
        this.afStore.collection('users').doc(this.otherUID).collection('subscribing').doc(doc.data().authorID).get().subscribe(data => {
          if (data.exists) {
            user.subscribed = true;
          } else {
            user.subscribed = false;
          }
        });
        this.afStore.collection('users').doc(doc.data().authorID).get().subscribe(data => {
          user.uid = data.data()['uid'];
          user.profilePic = data.data()['profilePic'];
          user.username = data.data()['username'];
        });

        this.users.push(user);
      });

      if (users.size % 20 == 0 && users.size != 0 && users.size > this.moreUsers - 20) {
        this.moreUsers = this.moreUsers + 20;
        this.moreUsersAvailable = true;
      } else {
        this.moreUsersAvailable = false;
      }
    });
  }

  loadSubscribingUsers(collection) {
    this.afStore.collection('users').doc(this.otherUID).collection(collection, ref => ref.orderBy('subscribedAt', 'desc').limit(20)).get().subscribe((users) => {
      users.docs.forEach(doc => {
        let user = {username: '', profilePic: '', uid: '', subscribed: true};

        this.afStore.collection('users').doc(doc.data().userID).get().subscribe((details) => {
          user.username = details.data()['username'];
          user.profilePic = details.data()['profilePic'];
          user.uid = details.data()['uid'];
        });

        if (this.uid != this.otherUID) {
          this.afStore.collection('users').doc(this.otherUID).collection('subscribing').doc(doc.data().userID).get().subscribe(data => {
            if (data.exists) {
              user.subscribed = true;
            } else {
              user.subscribed = false;
            }
          });
        }

        this.users.push(user);
      });

      if (users.size % 20 == 0 && users.size != 0 && users.size > this.moreUsers - 20) {
        this.moreUsers = this.moreUsers + 20;
        this.moreUsersAvailable = true;
      } else {
        this.moreUsersAvailable = false;
      }
    });
  }

  loadMoreUsers() {
    if (this.subcollection == 'subscribing') {
      this.loadMoreSubscribingUsers();
    } else if (this.subcollection == 'subscribers') {
      this.loadMoreSubscribers();
    }
  }


  loadMoreSubscribers() {
    this.afStore.collection('users').doc(this.otherUID).collection(this.subcollection, ref => ref.orderBy('subscribedAt', 'desc').where('subscribedAt', '<', this.users[this.users.length - 1].subscribedAt).limit(this.moreUsers)).get().subscribe((users) => {
      users.docs.forEach(doc => {
        let user = {username: '', profilePic: '', uid: '', subscribed: true};
        this.afStore.collection('users').doc(this.otherUID).collection('subscribing').doc(doc.data().authorID).get().subscribe(data => {
          if (data.exists) {
            user.subscribed = true;
          } else {
            user.subscribed = false;
          }
        });
        this.afStore.collection('users').doc(doc.data().authorID).get().subscribe(data => {
          user.uid = data.data()['uid'];
          user.profilePic = data.data()['profilePic'];
          user.username = data.data()['username'];
        });

        this.users.push(user);
      });

      if (users.size % 20 == 0 && users.size != 0 && users.size > this.moreUsers - 20) {
        this.moreUsers = this.moreUsers + 20;
        this.moreUsersAvailable = true;
      } else {
        this.moreUsersAvailable = false;
      }
    });
  }

  loadMoreSubscribingUsers() {
    this.afStore.collection('users').doc(this.otherUID).collection(this.subcollection, ref => ref.orderBy('subscribedAt', 'desc').where('subscribedAt', '<', this.users[this.users.length - 1].subscribedAt).limit(this.moreUsers)).get().subscribe((users) => {
      users.docs.forEach(doc => {
        let user = {username: '', profilePic: '', uid: '', subscribed: true};

        this.afStore.collection('users').doc(doc.data().userID).get().subscribe((details) => {
          user.username = details.data()['username'];
          user.profilePic = details.data()['profilePic'];
          user.uid = details.data()['uid'];
        });

        if (this.uid != this.otherUID) {
          this.afStore.collection('users').doc(this.otherUID).collection('subscribing').doc(doc.data().userID).get().subscribe(data => {
            if (data.exists) {
              user.subscribed = true;
            } else {
              user.subscribed = false;
            }
          });
        }

        this.users.push(user);
      });

      if (users.size % 20 == 0 && users.size != 0 && users.size > this.moreUsers - 20) {
        this.moreUsers = this.moreUsers + 20;
        this.moreUsersAvailable = true;
      } else {
        this.moreUsersAvailable = false;
      }
    });
  }

  async subscribe(id, i) {

    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
    });
    await loading.present();

    this.afStore.collection('users').doc(id).collection('subscribers').doc(this.uid).set({
      authorID: this.uid,
      subscribedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      this.afStore.collection('users').doc(this.uid).collection('subscribing').doc(id).set({
        userID: id,
        subscribedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.users[i].subscribed = true;
        loading.dismiss();
      }).catch((error) => {
        loading.dismiss();
        this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
      });
    }).catch((error) => {
      loading.dismiss();
      this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
    });

  }

  async unsubscribe(id, i) {

    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
    });
    await loading.present();

    this.afStore.collection('users').doc(this.uid).collection('subscribing').doc(id).delete().then(() => {
      this.afStore.collection('users').doc(id).collection('subscribers').doc(this.uid).delete().then(() => {
        this.users[i].subscribed = false;
        loading.dismiss();
      }).catch((error) => {
        loading.dismiss();
        this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
      });
    }).catch((error) => {
      loading.dismiss();
      this.presentAlert('Error', 'Sorry something went wrong. Please try again later.....');
    });

  }

  viewProfile(id) {
    if (id != this.uid) {
      sessionStorage.setItem('uid_other', id);
      this.router.navigate(['/other-profile']);
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
