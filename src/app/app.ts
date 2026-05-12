import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileStore } from './profile/application/profile-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Eagerly instantiate ProfileStore so preferences (language, theme, currency)
  // are loaded from the API on app startup, regardless of the first route visited.
  private readonly _profileStore = inject(ProfileStore);
}
