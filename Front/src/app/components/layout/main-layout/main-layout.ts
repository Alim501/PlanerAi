import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarCustom } from '../navbar-custom/navbar-custom';
import { FooterCustom } from '../footer-custom/footer-custom';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarCustom, FooterCustom],
  templateUrl: `./main-layout.html`,
  styleUrl: `./main-layout.scss`,
})
export class MainLayoutComponent {}
