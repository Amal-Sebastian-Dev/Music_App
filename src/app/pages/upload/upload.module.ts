import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadPageRoutingModule } from './upload-routing.module';

import { UploadPage } from './upload.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerModalComponent } from 'src/app/components/player-modal/player-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadPageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [UploadPage, PlayerModalComponent]
})
export class UploadPageModule {}
