import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

// Send unauthorized users to login
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/signin-signup']);

// Automatically log in users
const redirectLoggedInToHome = () => redirectLoggedInTo(['/home']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin-signup',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'chats',
    loadChildren: () => import('./pages/chats/chats.module').then( m => m.ChatsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'comments',
    loadChildren: () => import('./pages/comments/comments.module').then( m => m.CommentsPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'other-profile',
    loadChildren: () => import('./pages/other-profile/other-profile.module').then( m => m.OtherProfilePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'own-profile',
    loadChildren: () => import('./pages/own-profile/own-profile.module').then( m => m.OwnProfilePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'personal-chat',
    loadChildren: () => import('./pages/personal-chat/personal-chat.module').then( m => m.PersonalChatPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'signin-signup',
    loadChildren: () => import('./pages/signin-signup/signin-signup.module').then( m => m.SigninSignupPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'upload',
    loadChildren: () => import('./pages/upload/upload.module').then( m => m.UploadPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'users-list',
    loadChildren: () => import('./pages/users-list/users-list.module').then( m => m.UsersListPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
