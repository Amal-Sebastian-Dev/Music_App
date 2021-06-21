import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, GestureController, IonRange, IonToolbar } from '@ionic/angular';
import { Howl } from 'howler';
import { ChatService } from './services/chat/chat.service';
import { PlayerService } from './services/player/player.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChild(IonToolbar, {read: ElementRef}) toolbar: ElementRef;

  paused = false;
  currPlayingPost = null;
  currPlayingPostIndex = null;
  miniPlayerIcon = "play";

  songData = {songName: '', authorName: '', index: 0, song: '', pic: ''};

  player: Howl = null;
  isPlaying = false;
  progress = 0;
  roundedProgress: String = '0';
  @ViewChild('range') range: IonRange;

  constructor(
    private alertCtrl: AlertController,
    private playerService: PlayerService,
    public chatService: ChatService
  ) {
    this.getSongData();

    this.getCancelData();
  }

  getCancelData() {
    this.playerService.getCancelObservable().subscribe((data) => {
      if (data.cancel == true) {
        this.cancelAudioLoad();
      }
    })
  }

  getSongData() {
    this.playerService.getObservable().subscribe((data) => {
      //console.log('Data received', data);
      this.songData.song = data.song;
      this.songData.authorName = data.authorName;
      this.songData.pic = data.pic;
      this.songData.index = data.index;
      this.songData.songName = data.songName;
      //this.songData = data.song;
      console.log(data);
      console.log('++++++', this.songData)
      this.play(data.song);
    });
  }

  play(src) {

    this.isPlaying = false;

    if (this.player) {
      this.cancelAudio();
      this.player.stop();
    }

    this.player = new Howl({
      src: [src],
      //html5: true,

      onplay: () => {

        console.log('on Play' + this.player.duration())

        this.updateProgress();

        this.playerService.publishLoadingData({
          index: this.songData.index,
          value: false
        });

        this.isPlaying = true;

        this.miniPlayerIcon = "pause";

      },

      onend: () => {
        console.log('on end');
        this.miniPlayerIcon = "play";
        this.paused = true;
        //this.player.unload();
        //this.cancelAudio();
      },

      onloaderror: (error) => {
        console.log('loading error' + error);
      },

      onplayerror: (error) => {
        this.presentAlert('Error playing', error);
        console.log(error);
      }
    });

    this.player.play();

  }

  cancelAudioLoad() {
    this.player.unload();
    //this.posts[this.currPlayingPostIndex].loading = false;
  }

  seek() {
    let newValue = +this.range.value;
    let duration = this.player.duration();
    this.player.seek(duration * ( newValue / 100));
  }

  updateProgress() {
    let seek = this.player.seek();
    this.progress = (seek / this.player.duration()) * 100 || 0;

    let val = seek || 0;

    const min = Math.floor((val/60/60)*60);
    const sec = Math.floor(((val/60/60)*60 - min)*60);
    this.roundedProgress = min + 'm' + sec + 's';

    setTimeout(() => {
      if(this.player != null) {
        this.updateProgress();
      }
    }, 1000);
  }

  pauseAudio() {

    if (this.paused) {
      //this.posts[this.currPlayingPostIndex].paused = false;
      this.miniPlayerIcon = "pause";
      this.paused = false;

      this.player.play();
    } else {
      //this.posts[this.currPlayingPostIndex].paused = true;
      this.miniPlayerIcon = "play";
      this.paused = true;
      this.player.pause()
    }
  }

  cancelAudio() {
    this.isPlaying = false;
    //document.getElementById("miniPlayer").style.bottom = "-200px";
    console.log('------')
    //this.posts[this.currPlayingPostIndex].playing = false;
    //this.posts[this.currPlayingPostIndex].paused = false;
    this.miniPlayerIcon = "play";
    //this.currPlayingPost = null;
    //this.currPlayingPostIndex = null;
    this.player.stop();
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
