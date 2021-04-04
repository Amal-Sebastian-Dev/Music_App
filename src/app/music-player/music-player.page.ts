import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Media } from '@ionic-native/media/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.page.html',
  styleUrls: ['./music-player.page.scss'],
})
export class MusicPlayerPage implements OnInit {

  audioPath;
  audio = null;

  loading = false;

  analyzer;
  frequencyData;
  numberOfBars = 50;

  playIcon = "pause-circle";
  audioDuration: number;
  currentPosition: number;
  restTime: string;
  currentTime: string;

  tags = [
    "tag1",
    "tag2",
    "tag3",
    "tag4",
    "tag5"
  ];
  selectedTag;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private media: Media,
    private toastCtrl: ToastController,
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.audioPath = this.router.getCurrentNavigation().extras.state;
      }
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.PlayAudio(this.audioPath.path);
    //this.audioVisualizer();
  }

  ionViewWillLeave() {
    if (this.audio != null) {
      this.audio.release();
    }
  }

  async tagSelected() {
    if (this.selectedTag.length > 3) {
      this.selectedTag = null;
      let toast = await this.toastCtrl.create({
        message: "Maximum three tags only allowed",
        duration: 3000,
      });
      toast.present();
    }
  }

  PlayAudio(path) {

    this.loading = false;

    document.getElementById("preloader").style.opacity = "0";
    document.getElementById("preloader").style.zIndex = "-1";

    this.audio = this.media.create(path);
    this.audio.onStatusUpdate.subscribe(status => {
      console.log(status);
    });
    this.audio.onSuccess.subscribe(() => console.log("Action is successful"));
    this.audio.onError.subscribe(error => console.log("Error : ", error));

    this.audio.play();

    setInterval(() => {
      this.audio.getCurrentPosition().then((position) => {
        this.audioDuration = Math.floor(this.audio.getDuration());
        this.currentPosition = Math.floor(position);
        this.currentTime = this.convertSec(this.currentPosition);
        this.restTime = this.convertSec(this.audioDuration - this.currentPosition);
      });
    }, 500);
  }

  convertSec(seconds: number) {
    const min = Math.floor((seconds/60/60) * 60);
    const sec = Math.floor(((seconds/60/60) * 60 - min) * 60);
    return min + 'm' + sec + 's';
  }

  playPause() {
    if (this.playIcon == "pause-circle") {
      this.playIcon = "play-circle";
      this.audio.pause();
    } else {
      this.playIcon = "pause-circle";
      this.audio.play();
    }
  }

  changePosition() {
    this.audio.seekTo(this.currentPosition * 1000);
    this.currentTime = this.convertSec(this.currentPosition);
    this.restTime = this.convertSec(this.audioDuration - this.currentPosition);
  }

  //audioVisualizer() {
//
  //  this.audio = this.media.create(this.audioPath.path);
  //  const ctx = new AudioContext();
  //  const audioSource = ctx.createMediaElementSource(this.audio);
//
  //  this.analyzer = ctx.createAnalyser();
//
  //  audioSource.connect(this.analyzer);
  //  audioSource.connect(ctx.destination);
//
  //  this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
  //  this.analyzer.getByteFrequencyData(this.frequencyData);
//
  //  const visualizerContainer = document.querySelector(".visualizer-container")
//
  //  for (let i = 0; i < this.frequencyData.length; i++) {
  //    const bar = document.createElement("div");
  //    bar.setAttribute("id", "bar" + i);
  //    bar.setAttribute("class", "visualizer-container_bar");
  //    visualizerContainer.appendChild(bar);
  //  }
//
  //  this.renderFrame();
//
  //  //setInterval(this.renderFrame, 1000);
//
  //  //this.PlayAudio();
  //}
//
  //renderFrame() {
  //  this.analyzer.getByteFrequencyData(this.frequencyData);
  //  for (let i = 0; i < this.frequencyData.length; i++) {
//
  //    //const index = (i + 10) * 2;
  //    const fd = this.frequencyData[i];
//
  //    const bar = document.getElementById("bar" + i);
  //    if(!bar) {
  //      continue;
  //    }
//
  //    const barHeight = Math.max(4, fd || 0);
  //    bar.style.height = barHeight + "px";
  //  }
//
  //  window.requestAnimationFrame(this.renderFrame);
  //}




}
