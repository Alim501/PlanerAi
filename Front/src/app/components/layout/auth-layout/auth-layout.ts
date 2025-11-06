import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbar } from '../public-navbar/public-navbar';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbar],
  templateUrl: `./auth-layout.html`,
  styleUrl: `./auth-layout.scss`,
})
export class AuthLayoutComponent {}
