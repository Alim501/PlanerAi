import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterCustom } from './footer-custom';

describe('FooterCustom', () => {
  let component: FooterCustom;
  let fixture: ComponentFixture<FooterCustom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterCustom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterCustom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
