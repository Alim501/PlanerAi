import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCustom } from './navbar-custom';

describe('NavbarCustom', () => {
  let component: NavbarCustom;
  let fixture: ComponentFixture<NavbarCustom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarCustom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarCustom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
