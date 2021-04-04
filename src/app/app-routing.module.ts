import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./signin-signup/signin-signup.module').then( m => m.SigninSignupPageModule)
  },
  {
    path: 'signin-signup',
    loadChildren: () => import('./signin-signup/signin-signup.module').then( m => m.SigninSignupPageModule)
  },
  {
    path: 'music-player',
    loadChildren: () => import('./music-player/music-player.module').then( m => m.MusicPlayerPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
