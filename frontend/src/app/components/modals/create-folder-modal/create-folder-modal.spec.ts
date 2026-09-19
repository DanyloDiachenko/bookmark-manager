import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFolderModal } from './create-folder-modal';

describe('CreateFolderModal', () => {
  let component: CreateFolderModal;
  let fixture: ComponentFixture<CreateFolderModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFolderModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFolderModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
