import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddregisterComponent } from './addregister.component';

describe('AddregisterComponent', () => {
  let component: AddregisterComponent;
  let fixture: ComponentFixture<AddregisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddregisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
