import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSearchSelectComponent } from './custom-search-select.component';

describe('CustomSearchSelectComponent', () => {
  let component: CustomSearchSelectComponent;
  let fixture: ComponentFixture<CustomSearchSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomSearchSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
