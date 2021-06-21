import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private songData = new Subject<any>();
  private loadingData = new Subject<any>();
  private cancelData = new Subject<any>();

  publishSomeData(data: any) {
    this.songData.next(data);
  }

  getObservable(): Subject<any> {
    return this.songData;
  }

  publishLoadingData(data: any) {
    this.loadingData.next(data);
  }

  getloadingObservable(): Subject<any> {
    return this.loadingData;
  }

  publishCancelData(data: any) {
    this.cancelData.next(data);
  }

  getCancelObservable(): Subject<any> {
    return this.cancelData;
  }

}
