import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkSecondaryComponent } from './mark-secondary.component';

describe('MarkSecondaryComponent', () => {
  let component: MarkSecondaryComponent;
  let fixture: ComponentFixture<MarkSecondaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkSecondaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
