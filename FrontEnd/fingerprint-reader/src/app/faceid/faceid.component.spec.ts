import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceidComponent } from './faceid.component';

describe('FaceidComponent', () => {
  let component: FaceidComponent;
  let fixture: ComponentFixture<FaceidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
