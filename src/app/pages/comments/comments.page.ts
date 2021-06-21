import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  uid: string;
  postID: string;

  comment: string = '';
  loading = false;
  reply: string = null;

  moreComments = 10;
  moreCommentsAvailable = false;

  comments = [];

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private afStore: AngularFirestore,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.uid = localStorage.getItem('uid');
    this.postID = sessionStorage.getItem('postID');

    this.loadComments();
  }

  ngOnInit() {}

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  loadComments() {
    this.afStore.collection('posts')
                .doc(this.postID)
                .collection('comments', ref => ref.orderBy('createdAt', 'desc').limit(this.moreComments))
                .valueChanges().subscribe((docs) => {

      this.comments = []

      docs.forEach(doc => {

        const data = doc;

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('replies')
                    .get().subscribe((replies) => {

          data.repliesLen = replies.size;

        });

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('likes')
                    .valueChanges().subscribe((likes) => {

          data.liked = false;
          if (likes.length > 0) {
            let found = likes.some(like => like.authorID === this.uid);
            if (found) {
              data.liked = true;
            }
          }
          data.likes = likes.length;
        });

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('dislikes')
                    .valueChanges().subscribe((dislikes) => {

          data.disliked = false;
          if (dislikes.length > 0) {
            let found = dislikes.some(dislike => dislike.authorID === this.uid);
            if (found) {
              data.disliked = true;
            }
          }
          data.dislikes = dislikes.length;
        });

        this.afStore.collection('users')
                    .doc(doc.authorID)
                    .get().subscribe((userData) => {

                     console.log(userData.data()['username']);

            data.profilePic = userData.data()['profilePic'];
            data.authorName = userData.data()['username'];
            if (doc.createdAt != null) {
              data.createdAt = doc.createdAt.toDate();
            }
            data.moreReplies = 2;
            data.moreRepliesAvailable = false;


        });


        this.comments.push(data);

      })

      console.log('before ', docs.length);
      console.log('more comments len ', this.moreComments)
      if (docs.length % 10 == 0 && docs.length != 0 && docs.length > this.moreComments - 10) {
        console.log('if ', docs.length);
        this.moreComments = this.moreComments + 10;
        this.moreCommentsAvailable = true;
      } else {
        console.log('else ', docs.length);
        this.moreCommentsAvailable = false;
      }
    });
  }

  loadMoreComments() {



    this.afStore.collection('posts')
                .doc(this.postID)
                .collection('comments', ref => ref.orderBy('createdAt', 'desc').where('createdAt', '<', this.comments[this.comments.length - 1].createdAt).limit(this.moreComments))
                .valueChanges().subscribe((docs) => {

      //this.comments = []

      docs.forEach(doc => {

        const data = doc;

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('replies')
                    .get().subscribe((replies) => {

          data.repliesLen = replies.size;

        });

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('likes')
                    .valueChanges().subscribe((likes) => {

          data.liked = false;
          if (likes.length > 0) {
            let found = likes.some(like => like.authorID === this.uid);
            if (found) {
              data.liked = true;
            }
          }
          data.likes = likes.length;
        });

        this.afStore.collection('posts')
                    .doc(this.postID)
                    .collection('comments')
                    .doc(doc.commentID)
                    .collection('dislikes')
                    .valueChanges().subscribe((dislikes) => {

          data.disliked = false;
          if (dislikes.length > 0) {
            let found = dislikes.some(dislike => dislike.authorID === this.uid);
            if (found) {
              data.disliked = true;
            }
          }
          data.dislikes = dislikes.length;
        });

        this.afStore.collection('users')
                    .doc(doc.authorID)
                    .get().subscribe((userData) => {

                     console.log(userData.data()['username']);

            data.profilePic = userData.data()['profilePic'];
            data.authorName = userData.data()['username'];
            if (doc.createdAt != null) {
              data.createdAt = doc.createdAt.toDate();
            }
            data.moreReplies = 2;
            data.moreRepliesAvailable = false;


        });


        this.comments.push(data);

      })

      console.log('before ', docs.length);
      console.log('more comments len ', this.moreComments)
      if (docs.length % 10 == 0 && docs.length != 0 && docs.length > this.moreComments - 10) {
        console.log('if ', docs.length);
        this.moreComments = this.moreComments + 10;
        this.moreCommentsAvailable = true;
      } else {
        console.log('else ', docs.length);
        this.moreCommentsAvailable = false;
      }
    });
  }

  async createComment() {

    const cmnt = this.comment;

    if (this.comment == null || this.comment == '') {
      this.presentToast('please enter something');
    } else if (this.loading == false) {

      this.loading = true;


      //const loading = await this.loadingCtrl.create({
      //  cssClass: 'my-custom-class',
      //  backdropDismiss: true
      //});
//
      //await loading.present();

      let cmntID = this.afStore.createId();
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(cmntID).set({

        authorID: this.uid,
        comment: this.comment,
        commentID: cmntID,
        createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        dislikes: 0

      }).then(() => {
        this.loading = false;
        this.comment = '';
        //loading.dismiss();
      }).catch(() => {
        //loading.dismiss();
        this.presentToast('Please check your network connectivity');
      });

    }
  }

  likeComment(comment) {
    if (comment.disliked == true) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(comment.commentID)
                  .collection('dislikes')
                  .doc(this.uid).delete();
    }

    if (comment.liked == false) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(comment.commentID)
                  .collection('likes')
                  .doc(this.uid).set({

        authorID: this.uid,
        likedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  dislikeComment(comment) {
    if (comment.liked == true) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(comment.commentID)
                  .collection('likes')
                  .doc(this.uid).delete();
    }

    if (comment.disliked == false) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(comment.commentID)
                  .collection('dislikes')
                  .doc(this.uid).set({

        authorID: this.uid,
        dislikedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  loadReplies(comment) {

    this.afStore.collection('posts')
                .doc(this.postID)
                .collection('comments')
                .doc(comment.commentID)
                .collection('replies', ref => ref.orderBy('createdAt', 'desc').limit(comment.moreReplies))
                .valueChanges().subscribe((replies: any) => {

      for (let i = 0; i < this.comments.length; i++) {
        if (this.comments[i].commentID == comment.commentID) {

          this.comments[i].replies = [];
          replies.forEach(async reply => {

            this.afStore.collection('posts')
                        .doc(this.postID)
                        .collection('comments')
                        .doc(comment.commentID)
                        .collection('replies')
                        .doc(reply.replyID)
                        .collection('likes')
                        .valueChanges().subscribe((likes) => {

              reply.liked = false;
              if (likes.length > 0) {
                let found = likes.some(like => like.authorID === this.uid);
                if (found) {
                  reply.liked = true;
                }
              }
              reply.likes = likes.length;
            });

            this.afStore.collection('posts')
                        .doc(this.postID)
                        .collection('comments')
                        .doc(comment.commentID)
                        .collection('replies')
                        .doc(reply.replyID)
                        .collection('dislikes')
                        .valueChanges().subscribe((dislikes) => {

              reply.disliked = false;
              if (dislikes.length > 0) {
                let found = dislikes.some(like => like.authorID === this.uid);
                if (found) {
                  reply.disliked = true;
                }
              }
              reply.dislikes = dislikes.length;
            });

            this.afStore.collection('users').doc(reply.authorID).valueChanges().subscribe((data: any) => {
              reply.authorName = data.username;
              reply.profilePic = data.profilePic;
              reply.createdAt = reply.createdAt.toDate();
            });

            this.comments[i].replies.push(reply);
          });

          console.log(replies.length)
          if(replies.length % 2 == 0 && replies.length != 0 && replies.length > this.comments[i].moreReplies - 2) {
            this.comments[i].moreReplies = this.comments[i].moreReplies + 2;
            this.comments[i].moreRepliesAvailable = true;
          } else {
            this.comments[i].moreRepliesAvailable = false;
          }

          break;
        }
      }
    });
  }

  loadMoreReplies(comment) {

    this.afStore.collection('posts')
                .doc(this.postID)
                .collection('comments')
                .doc(comment.commentID)
                .collection('replies', ref => ref.orderBy('createdAt', 'desc').where('createdAt', '<', comment.replies[comment.replies.length - 1].createdAt).limit(comment.moreReplies))
                .valueChanges().subscribe((replies: any) => {

      for (let i = 0; i < this.comments.length; i++) {
        if (this.comments[i].commentID == comment.commentID) {

          //this.comments[i].replies = [];
          replies.forEach(async reply => {

            this.afStore.collection('posts')
                        .doc(this.postID)
                        .collection('comments')
                        .doc(comment.commentID)
                        .collection('replies')
                        .doc(reply.replyID)
                        .collection('likes')
                        .valueChanges().subscribe((likes) => {

              reply.liked = false;
              if (likes.length > 0) {
                let found = likes.some(like => like.authorID === this.uid);
                if (found) {
                  reply.liked = true;
                }
              }
              reply.likes = likes.length;
            });

            this.afStore.collection('posts')
                        .doc(this.postID)
                        .collection('comments')
                        .doc(comment.commentID)
                        .collection('replies')
                        .doc(reply.replyID)
                        .collection('dislikes')
                        .valueChanges().subscribe((dislikes) => {

              reply.disliked = false;
              if (dislikes.length > 0) {
                let found = dislikes.some(like => like.authorID === this.uid);
                if (found) {
                  reply.disliked = true;
                }
              }
              reply.dislikes = dislikes.length;
            });

            this.afStore.collection('users').doc(reply.authorID).valueChanges().subscribe((data: any) => {
              reply.authorName = data.username;
              reply.profilePic = data.profilePic;
              reply.createdAt = reply.createdAt.toDate();
            });

            this.comments[i].replies.push(reply);
          });

          console.log(replies.length)
          if(replies.length % 2 == 0 && replies.length != 0 && replies.length > this.comments[i].moreReplies - 2) {
            this.comments[i].moreReplies = this.comments[i].moreReplies + 2;
            this.comments[i].moreRepliesAvailable = true;
          } else {
            this.comments[i].moreRepliesAvailable = false;
          }

          break;
        }
      }
    });
  }

  likeReply(reply, commentID) {
    if (reply.disliked == true) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(commentID)
                  .collection('replies')
                  .doc(reply.replyID)
                  .collection('dislikes')
                  .doc(this.uid).delete();
    }

    if (reply.liked == false) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(commentID)
                  .collection('replies')
                  .doc(reply.replyID)
                  .collection('likes')
                  .doc(this.uid).set({

        authorID: this.uid,
        likedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  dislikeReply(reply, commentID) {
    if (reply.liked == true) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(commentID)
                  .collection('replies')
                  .doc(reply.replyID)
                  .collection('likes')
                  .doc(this.uid).delete();
    }

    if (reply.disliked == false) {
      this.afStore.collection('posts')
                  .doc(this.postID)
                  .collection('comments')
                  .doc(commentID)
                  .collection('replies')
                  .doc(reply.replyID)
                  .collection('dislikes')
                  .doc(this.uid).set({

        authorID: this.uid,
        dislikedAt: firebase.default.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  async replyComment(comment) {
    let replyAlert = await this.alertCtrl.create({
      message: '<div>' +
                '<ion-row class="comment-details">' +
                  '<ion-col size="2">' +
                    '<ion-avatar>' +
                      `<img src="${comment.profilePic}"/>` +
                    '</ion-avatar>' +
                  '</ion-col>' +
                  '<ion-col size="10">' +
                    '<ion-row>' +
                      `<p class="username">${comment.authorName}</p>` +
                    '</ion-row>' +
                  '</ion-col>' +
                '</ion-row>' +
                '<ion-row>' +
                  `<p class="comment">${comment.comment}</p>` +
                '</ion-row>' +
              '</div>' ,
      cssClass: 'reply-alert',
      inputs: [
        {
          name: 'reply',
          value: this.reply,
          placeholder: 'enter your reply',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'cancel',
          role: 'cancel'
        },
        {
          text: 'send',
          handler: async data => {
            if(data.reply == null || data.reply == '') {
              this.presentToast('please enter something');
            } else {

              const loading = await this.loadingCtrl.create({
                cssClass: 'my-custom-class',
                backdropDismiss: true
              });

              await loading.present();

              let replyID = this.afStore.createId();

              this.afStore.collection('posts')
                          .doc(this.postID)
                          .collection('comments')
                          .doc(comment.commentID)
                          .collection('replies')
                          .doc(replyID).set({

                replyID: replyID,
                reply: data.reply,
                likes: 0,
                dislikes: 0,
                authorID: this.uid,
                createdAt: firebase.default.firestore.FieldValue.serverTimestamp()
              }).then(() => {
                for (let i = 0; i < this.comments.length; i++) {
                 if (this.comments[i].commentID == comment.commentID) {
                   this.comments[i].repliesLen = this.comments[i].repliesLen + 1;
                 }
                }
                loading.dismiss();
              }).catch((error) => {
                this.presentToast('Please check your network');
                loading.dismiss();
              });
            }
          }
        }
      ]
    });

    await replyAlert.present();
  }

  viewProfile(id) {
    if (this.uid != id) {
      sessionStorage.setItem('uid_other', id);
      //this.modalCtrl.dismiss();
      this.router.navigate(['/other-profile']);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });

    toast.present();
  }

}
