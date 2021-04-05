import { Component } from '@angular/core';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  profilePic = "https://cultivatedculture.com/wp-content/uploads/2019/12/LinkedIn-Profile-Picture-Example-Madeline-Mann.jpeg";
  //profilePic = null;
  profilePicPath:string = null;

  constructor(
    private fileChooser: FileChooser,
    private filePath: FilePath,
  ) {}

  SelectFile() {
    let filter = {"mime": "audio/*"};
    this.fileChooser.open(filter).then((fileuri) => {
      this.filePath.resolveNativePath(fileuri).then((resolvedPath) => {
        this.profilePicPath = resolvedPath;
      });
    });
  }

}
