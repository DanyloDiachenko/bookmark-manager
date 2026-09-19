import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBookmarkModal } from './create-bookmark-modal';

describe('CreateBookmarkModal', () => {
  let component: CreateBookmarkModal;
  let fixture: ComponentFixture<CreateBookmarkModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBookmarkModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateBookmarkModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
