import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private plt: Platform
  ) {
  }

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
     this.registerPush();
    }
  }

  private registerPush() {

  }
}
