import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  uid: string;

  chatUsersDetails = [];
  backupList = [];

  searchBarEnabled = false;

  constructor(
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private router: Router,
    private db: AngularFireDatabase
  ) {
    this.uid = localStorage.getItem("uid");

    this.getChatsList();
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

  uploadPage() {
    document.getElementById("upload-btn").style.color = "white";
    document.getElementById("upload-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/upload']);
  }

  profilePage() {
    document.getElementById("profile-btn").style.color = "white";
    document.getElementById("profile-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/own-profile']);
  }

  homePage() {
    document.getElementById("home-btn").style.color = "white";
    document.getElementById("home-btn").style.background = "#4facfe";
    this.navCtrl.navigateRoot(['/home']);
  }

  tvPage() {
    document.getElementById("tv-btn").style.color = "white";
    document.getElementById("tv-btn").style.background = "#4facfe";
  }


  getChatsList() {

    this.afStore.collection("users").doc(this.uid).collection("chatsList", ref => ref.orderBy("time", 'desc')).valueChanges().subscribe((users) => {
      this.chatUsersDetails = [];
      users.forEach(user => {
        let userData = {uid: '', profilePic: '', username: '', lastMsg: '', time: '', status: ''};

        this.afStore.collection("users").doc(user.uid).valueChanges().subscribe((data: any) => {
          userData.uid = data.uid;
          userData.profilePic = data.profilePic;
          userData.username = data.username;
          userData.lastMsg = user.lastMessage;
          userData.time = user.time.substring(user.time.indexOf(" ") + 1,  user.time.lastIndexOf(":"));
        });

        this.db.object(`status/${user.uid}`).valueChanges().subscribe((value: any) => {
          //console.log(value.status);
          if (value == null) {
            userData.status = 'offline';
          } else {
            userData.status = value.status
          }
        });

        this.chatUsersDetails.push(userData);
        this.backupList.push(userData);
      })
    });
  }

  enableSearchBar() {
    this.searchBarEnabled = true;
  }

  disableSearchBar() {
    this.searchBarEnabled = false;
    this.chatUsersDetails = this.backupList;
  }

  searching(ev) {
    let input: string = ev.target.value;
    console.log(input)
    if (input == '' || input == null) {
      this.chatUsersDetails = this.backupList;
    } else {
      input = input.toLowerCase();
      this.chatUsersDetails = [];
      this.chatUsersDetails = this.backupList.filter(item => item.username.toLowerCase().indexOf(input) > -1);
    }
  }

  goToChat(uid) {
    sessionStorage.setItem("uid_other", uid);
    this.router.navigate(['/personal-chat']);
  }

  viewProfile(uid) {
    console.log(uid);
    sessionStorage.setItem('uid_other', uid);
    this.router.navigate(['/other-profile']);
  }

}
