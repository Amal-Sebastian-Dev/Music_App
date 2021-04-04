import { Component, OnInit, ViewChild } from '@angular/core';
import { Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  @ViewChild('fileButton') fileButton;

  recording: boolean = false;
  audioPath: string;
  audio: any;
  path;

  constructor(
    private file: File,
    private media: Media,
    private platform: Platform,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private router: Router
  ) {}



  ngOnInit() {
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.addEventListener('click', () => {

      if (!this.recording) {
        this.recording = true;
        recordBtn.style.background = "#53cc98";
        recordBtn.style.color = "#fff";
        document.querySelectorAll(".dot").forEach(el => {
          el.classList.add("anim-dot");
        });
        document.querySelector(".outerbigcircle").classList.add("anim-outercircle");
        this.StartRecord();
      } else {
        this.recording = false;
        recordBtn.style.background = "none";
        recordBtn.style.color = "#53cc98";
        document.querySelectorAll(".dot").forEach(el => {
          el.classList.remove("anim-dot");
        });
        document.querySelector(".outerbigcircle").classList.remove("anim-outercircle");
        this.StopRecord();
      }

    });
  }

  SelectFile() {
    this.fileChooser.open().then((fileuri) => {
      this.filePath.resolveNativePath(fileuri).then((resolvedPath) => {
        this.path = resolvedPath;
        let navigationExtras: NavigationExtras = {
          state: {
            path: resolvedPath
          }
        };
        this.router.navigate(['music-player'], navigationExtras);
      });
    });
  }

  StartRecord() {
    console.log("recording......");
    try {
      let fileName =
      'record' +
      new Date().getDate() +
      new Date().getMonth() +
      new Date().getFullYear() +
      new Date().getHours() +
      new Date().getMinutes() +
      new Date().getSeconds();
      // let filePath = '';
      if (this.platform.is('ios')) {
        fileName = fileName + '.m4a';
        this.audioPath = this.file.documentsDirectory + fileName;
        this.audio = this.media.create(this.audioPath.replace(/file:\/\//g, ''));
      } else if (this.platform.is('android')) {
        fileName = fileName + '.mp3';
        this.audioPath = this.file.externalDataDirectory + fileName;
        this.audio = this.media.create(this.audioPath.replace(/file:\/\//g, ''));
      }
      this.audio.startRecord();
    } catch (error) {
      console.log(error);
    }
  }

  StopRecord() {
    console.log( "stoppped recording !!");
    this.audio.stopRecord();
    let navigationExtras: NavigationExtras = {
      state: {
        path: this.audioPath
      }
    };
    this.router.navigate(['music-player'], navigationExtras);
  }
}
