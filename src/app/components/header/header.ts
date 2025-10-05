import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserAuth } from '../../services/user-auth';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{

  isUserLoggedIn!: boolean;
  constructor(private userAuthSer: UserAuth){

  }
  ngOnInit(): void {
    // this.isUserLoggedIn = this.userAuthSer.getUserLogged()

    // this.userAuthSer.getAuthSubject().subscribe({
    //   next:(status) => {
    //     this.isUserLoggedIn = status
    //   }
    // })
  }

}
