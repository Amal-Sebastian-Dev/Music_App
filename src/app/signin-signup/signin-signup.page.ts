import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-signup',
  templateUrl: './signin-signup.page.html',
  styleUrls: ['./signin-signup.page.scss'],
})
export class SigninSignupPage implements OnInit {

  $signInForm;
  $signUpForm;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");

    sign_up_btn.addEventListener('click', () => {
      container.classList.add("sign-up-mode");
    });

    sign_in_btn.addEventListener('click', () => {
      container.classList.remove("sign-up-mode");
    });

    this.$signInForm = document.getElementById('sign-in-form');
    this.$signInForm.addEventListener('submit', e => {
      this.login(e);
    });

    this.$signUpForm = document.getElementById('sign-up-form');
    this.$signUpForm.addEventListener('submit', e => {
      this.signup(e);
    });
  }

  login(e) {
    this.router.navigate(['/pages']);
  }
  signup(e) {
    this.router.navigate(['/pages']);
  }

}
