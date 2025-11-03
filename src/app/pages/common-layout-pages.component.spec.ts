import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonLayoutPagesComponent } from './common-layout-pages.component';

describe('CommonLayoutPagesComponent', () => {
  let component: CommonLayoutPagesComponent;
  let fixture: ComponentFixture<CommonLayoutPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonLayoutPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonLayoutPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
