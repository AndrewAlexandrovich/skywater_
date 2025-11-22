import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';

import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }
  
  async initializeApp() {
    await this.platform.ready();

    // Статусбар НЕ перекриває контент
    await StatusBar.setOverlaysWebView({ overlay: false });

    // Опціонально — зробити темний або світлий текст
    await StatusBar.setStyle({ style: Style.Dark });
  }
}
