import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalChatPageRoutingModule } from './personal-chat-routing.module';

import { PersonalChatPage } from './personal-chat.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AttachDrawerComponent } from 'src/app/components/attach-drawer/attach-drawer.component';
import { ViewPhotoComponent } from 'src/app/components/view-photo/view-photo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalChatPageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [PersonalChatPage, AttachDrawerComponent, ViewPhotoComponent]
})
export class PersonalChatPageModule {}
