import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbar } from '../public-navbar/public-navbar';
import { FooterCustom } from '../footer-custom/footer-custom';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbar, FooterCustom],
  templateUrl: `./public-layout.html`,
  styleUrl: `./public-layout.scss`,
})
export class PublicLayoutComponent {}
