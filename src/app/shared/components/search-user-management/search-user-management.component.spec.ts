import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUserManagementComponent } from './search-user-management.component';

describe('SearchUserManagementComponent', () => {
  let component: SearchUserManagementComponent;
  let fixture: ComponentFixture<SearchUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchUserManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
