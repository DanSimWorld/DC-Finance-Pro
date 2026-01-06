import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursTrackerComponent } from './hours-tracker.component';

describe('HoursTrackerComponent', () => {
  let component: HoursTrackerComponent;
  let fixture: ComponentFixture<HoursTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
