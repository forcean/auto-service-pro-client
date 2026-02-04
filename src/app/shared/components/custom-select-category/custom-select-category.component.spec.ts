import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSelectCategoryComponent } from './custom-select-category.component';

describe('CustomSelectCategoryComponent', () => {
  let component: CustomSelectCategoryComponent;
  let fixture: ComponentFixture<CustomSelectCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomSelectCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSelectCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
