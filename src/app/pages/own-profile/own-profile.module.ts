import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OwnProfilePageRoutingModule } from './own-profile-routing.module';

import { OwnProfilePage } from './own-profile.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfileEditModalComponent } from 'src/app/components/profile-edit-modal/profile-edit-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OwnProfilePageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [OwnProfilePage, ProfileEditModalComponent]
})
export class OwnProfilePageModule {}
