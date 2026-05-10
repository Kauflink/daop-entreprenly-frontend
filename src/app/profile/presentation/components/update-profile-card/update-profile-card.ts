import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-update-profile-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-profile-card.html',
  styleUrl: './update-profile-card.css',
})
export class UpdateProfileCard implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(ProfileStore);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const { firstName, lastName } = this.store.profile();
    this.form.setValue({ firstName, lastName });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.store.updateProfile(this.form.getRawValue());
  }
}
