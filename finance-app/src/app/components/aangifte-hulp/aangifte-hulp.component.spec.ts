import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AangifteHulpComponent } from './aangifte-hulp.component';

describe('AangifteHulpComponent', () => {
  let component: AangifteHulpComponent;
  let fixture: ComponentFixture<AangifteHulpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AangifteHulpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AangifteHulpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
