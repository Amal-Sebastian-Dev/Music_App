import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { ChatService } from '../chat/chat.service';

//export interface User {
//  uid: string;
//  email: string;
//}

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private chatService: ChatService
    ) {   }

  async signUp({username, password, email}) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      username + "@musicapp.com",
      password
    );

    const uid = credential.user.uid;

    localStorage.setItem("uid", uid);
    localStorage.setItem("username", username);
    localStorage.setItem('password', password);

    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      username: username,
      email: email,
      createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
      profilePic: null,
      bio: null
    })
  }

  signIn({username, password}) {
    return this.afAuth.signInWithEmailAndPassword(username + "@musicapp.com", password);
  }

  async signOut() {
    await this.chatService.setPresence('offline');
    return this.afAuth.signOut();
  }

}
