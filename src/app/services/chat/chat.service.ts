import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Base64 } from '@ionic-native/base64/ngx';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment';
import * as firebase from 'firebase/app';
import { tap, map, switchMap, first } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { of } from 'rxjs';

// 1. signed-in and using app (online)
// 2. signed-in but app is closed (offline)
// 3. signed-out but app is still opened (offline)
// 4. signed-out and app closed (offline)

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private base64: Base64,
    private afStorage: AngularFireStorage,
    private afStore: AngularFirestore,
    private toastCtrl: ToastController,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
  }

  getPresence(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }

  getUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  async setPresence(status: string) {
    const user = await this.getUser();

    if (user) {
      return this.db.object(`status/${user.uid}`).update({ status, timestamp: firebase.default.database.ServerValue.TIMESTAMP});
    }
  }

  updateOnUser() {
    const connection = this.db.object('.info/connected').valueChanges().pipe(
      map(connected => connected ? 'online' : 'offline')
    );

    return this.afAuth.authState.pipe(
      switchMap(user => user ? connection : of('offline')),
      tap(status => this.setPresence(status))
    );
  }

  updateOnDisconnect() {
    return this.afAuth.authState.pipe(
      tap(user => {
        if (user) {
          this.db.object(`status/${user.uid}`).query.ref.onDisconnect().update({
            status: 'offline',
            timestamp: firebase.default.database.ServerValue.TIMESTAMP
          });
        }
      })
    );
  }

  uploadFile(path: string, uid: string, fileType: string) {

    this.presentToast(path);

    return new Promise((result, reject) => {

      this.base64.encodeFile(path).then(async (base64) => {

        let name = path.substr(path.lastIndexOf('/') + 1);

        let ext = name.substr(name.lastIndexOf('.') + 1);

        let messageSplit = base64.split('data:image/*;charset=utf-8;base64,')[1];

        const filePath = `messages/user_${uid}_${ new Date().getTime() }.${ext}`;
        let task = this.afStorage.ref(filePath).putString(messageSplit, 'base64');

        task.then(() => {

          task.task.snapshot.ref.getDownloadURL().then(async (downloadUrl) => {

            let sender = localStorage.getItem("uid");
            let receiver = sessionStorage.getItem("uid_other");

            await this.sendMessage({sender: sender, receiver: receiver, msg: downloadUrl, msgType: fileType, fileName: name});

            result(true);

          }).catch((error) => {
            reject(error);
          });

        });

        task.catch((error) => {
          reject(error);
        });

      }).catch(error => {
        reject(error);
      });

    })

  }

  sendMessage({sender, receiver, msg, msgType, fileName}) {
    return new Promise((result, reject) => {

      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      let date = mm + '-' + dd + '-' + yyyy;
      let now = moment().format("HH:mm:ss");

      this.afStore.collection("chats").doc(sender).collection(receiver).add({
        time: date + ", " + now,
        textMessage: msg,
        type: msgType,
        sender: sender,
        fileName: fileName
      });

      this.afStore.collection("chats").doc(receiver).collection(sender).add({
        time: date + ", " + now,
        textMessage: msg,
        type: msgType,
        sender: sender,
        fileName: fileName
      });

      this.afStore.collection("users").doc(sender).collection("chatsList").doc(receiver).set({
        uid: receiver,
        time: date + ", " + now,
        lastMessage: msg,
        type: msgType,
        sender: sender,
        fileName: fileName
      });

      this.afStore.collection("users").doc(receiver).collection("chatsList").doc(sender).set({
        uid: sender,
        time: date + ", " + now,
        lastMessage: msg,
        type: msgType,
        sender: sender,
        fileName: fileName
      }).then(() => {
        result(true);
      }).catch((error) => {
        this.presentToast('sorry, could not send messagse');
        reject(error);
      });

    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
  }
}
