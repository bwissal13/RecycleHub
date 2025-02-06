import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreModule } from './core/core.module';
import { DebugButtonComponent } from './core/components/debug-button/debug-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoreModule, DebugButtonComponent],
  template: `
    <router-outlet></router-outlet>
    <app-debug-button></app-debug-button>
  `
})
export class AppComponent {
  title = 'RecycleHub';
}
