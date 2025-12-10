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
	
	this.applySafeArea();
  }
  
  
  applySafeArea() {
  const computedTop = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("env(safe-area-inset-top)"),
    10
  );

  const computedBottom = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("env(safe-area-inset-bottom)"),
    10
  );

  // ---- TOP FIX: якщо більше 40px → вважаємо це баг
  const safeTop =
    Number.isFinite(computedTop) && computedTop > 0 && computedTop < 40
      ? computedTop
      : 0;

  // ---- BOTTOM FIX: якщо більше 30px → вважаємо це баг
  const safeBottom =
    Number.isFinite(computedBottom) && computedBottom > 0 && computedBottom < 30
      ? computedBottom
      : 0;

  document.documentElement.style.setProperty("--real-safe-top", safeTop + "px");
  document.documentElement.style.setProperty("--real-safe-bottom", safeBottom + "px");
}
  
}
