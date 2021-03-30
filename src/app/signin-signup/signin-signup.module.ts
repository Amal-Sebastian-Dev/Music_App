import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SigninSignupPageRoutingModule } from './signin-signup-routing.module';

import { SigninSignupPage } from './signin-signup.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SigninSignupPageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [SigninSignupPage]
})
export class SigninSignupPageModule {}
