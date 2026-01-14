import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCategoryOptionComponent } from './custom-category-option.component';

describe('CustomCategoryOptionComponent', () => {
  let component: CustomCategoryOptionComponent;
  let fixture: ComponentFixture<CustomCategoryOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomCategoryOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomCategoryOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
