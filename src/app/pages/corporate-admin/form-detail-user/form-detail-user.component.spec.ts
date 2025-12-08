import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDetailUserComponent } from './form-detail-user.component';

describe('FormDetailUserComponent', () => {
  let component: FormDetailUserComponent;
  let fixture: ComponentFixture<FormDetailUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormDetailUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDetailUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
