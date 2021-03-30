import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{

  @ViewChild('fileButton') fileButton;

  recording: boolean = false;

  constructor() {}



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
    this.fileButton.nativeElement.click();
  }

  async fileChanged(event) {
    const files = event.target.files;
    //this.fileToUpload = files[0];
  }

  StartRecord() {
    console.log("recording......");
  }

  StopRecord() {
    console.log( "stoppped recording !!");
  }
}
