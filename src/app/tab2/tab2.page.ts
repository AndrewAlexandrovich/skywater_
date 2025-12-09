import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
//for settings
import { Capacitor } from '@capacitor/core';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
//barcode
import { Barcode, BarcodeScanner, BarcodeFormat, LensFacing, BarcodesScannedEvent } from '@capacitor-mlkit/barcode-scanning';
import type { PluginListenerHandle } from '@capacitor/core';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public isSupported: boolean | null = null;
  private backButtonListener: any;

  public qrcode:any = false;
  public show_empty:any = true;
  public count_bottles:any=0;
  public count_liters:any=0;
  public progress_ll:any = 0;
  public to_next_l:any = 100;
  public button_scanner_status:any = false;
  public description_how_to:any = '';

  //text
  public text_title:any=false;
  public text_text:any=false;
  public svg_class = 'circle-chart';
  //
  public to_next_bonus_liter:any = 0;
  public myLitreModal:any = false;
  public progress_l:any = '';
  public modal_bl_title:any = '';
  public modal_bl_content:any = '';
  //
  public prices:any = '';
  public bonus_step_l:any = '';
  
  public last_code:any = '';
  
  public custom_message:any = false;
  public custom_message_color:string = 'primary';
  public custom_message_header:string = 'Зверніть увагу';
  public custom_message_icon:string = '';
  public custom_message_text:string = '';
  
  closemyLitModal(){
    this.myLitreModal = false;
  }
  openmyLitModal(){
    this.myLitreModal = true;
  }

  //
  getApiData(){
    let params = {
        token       : localStorage.getItem('token'),
        user_id     : localStorage.getItem('user_id')
    };

    this.http.post('https://skywater.com.ua/api/index.php?type=getQrAndBonuses', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json.text_title){
        this.text_title = json.text_title;
      }
      if(json.text_text){
        this.text_text = json.text_text;
      }
      if(json['error']){
        //this.showToast(json['error'], 'danger');
      }else{
        this.show_empty = false;
        if(json.bonuses_boutles){
          this.count_bottles = json.bonuses_boutles;
        }
        if(json.bonuses_liters_new){
          this.count_liters = json.bonuses_liters_new;
        }
        if(json.qr_code_path){
          this.qrcode = json.qr_code_path;
        }

        if(json.scanner_status){
          this.button_scanner_status = true;
        }else{
          this.button_scanner_status = false;
        }

        if(json.how_scanner_work){
          this.description_how_to = json.how_scanner_work;
        }

        if(json.prices){
          this.prices = json.prices;
        }

        this.bonus_step_l = json.bonus_step_l;

        if(json.to_next_bonusL && json.to_next_bonusL>0){
          this.to_next_l = 100-json.to_next_bonusL;
          this.progress_ll = json.to_next_bonusL / 100;
          if(this.to_next_l == 0){
            this.to_next_l = 100;
            this.progress_ll = 0;
          }
        }

        if(json.to_next_bonusL > 0){
          let segment = 370 / this.bonus_step_l;
          let percent =  json.bonuses_liters * segment;
          this.progress_l = percent+', 700';
        }else{
          this.progress_l = '0, 700';
        }

        this.modal_bl_title   = json.modal_bl_title;
        this.modal_bl_content = json.modal_bl_content;
        this.to_next_bonus_liter = json.bonuses_liters;
		
		
		if(typeof json['show_message'] != 'undefined'){
			if(typeof json['show_message']['color'] != 'undefined' && json['show_message']['color']){
				this.custom_message_color = json['show_message']['color'];
			}
			if(typeof json['show_message']['header'] != 'undefined' && json['show_message']['header']){
				this.custom_message_header = json['show_message']['header'];
			}
			if(typeof json['show_message']['icon'] != 'undefined' && json['show_message']['icon']){
				this.custom_message_icon = json['show_message']['icon'];
			}
			if(typeof json['show_message']['text'] != 'undefined' && json['show_message']['text']){
				this.custom_message_text = json['show_message']['text'];
				this.custom_message = true;
			}
		}
		
      }
    });

  }

  //scanner code
  /*Показати алерт помилку про доступ до камери*/
  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Доступ до камери',
      message: 'Будь ласка, дозвольте застосунку SkyWater використовувати камеру',
      buttons: [
      {
        text: 'Відміна',
        role: 'cancel',
        handler: () => {
        },
      },
      {
        text: 'Налаштування',
        role: 'confirm',
        handler: () => {
          this.openSettings(); // open app settings
        },
      },
    ]
    });
    await alert.present();
  }
  /*Запросити доступ до камери*/
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }
  /*Завершити сканування*/
	public async stopScan(): Promise<void> {
	  try {
		document.querySelector('body')?.classList.remove('barcode-scanner-active');
		await BarcodeScanner.stopScan();
	  } catch (err) {
		console.error('Failed to stop scanner:', err);
	  }
	}
/*Відправити код на сервер для створення замовлення та перевірки*/
checkBarcode(barcode:any){
  let params = {
    user_id : localStorage.getItem('user_id'),
    token   : localStorage.getItem('token'),
    barcode : barcode
  };
  this.http.post('https://skywater.com.ua/api/index.php?type=checkQRlocalOrder', JSON.stringify(params)).subscribe((response) => {
    let json = JSON.parse(JSON.stringify(response));
    this.stopScan();
    if(json.success){
      this.showToast(json.success, 'success');
      if(json.order_id){
        setTimeout(() => {
          this.router.navigate(['success-order',{order_id:json.order_id}])
        }, 2500);
      }
    }else if(json.error){
      this.showToast(json.error, 'danger');
    }
  });

}
/*Відсканувати 1 код і закртит вікно камери*/
/*
//prev ver 
public scanSingleBarcode = async () => {
  const granted = await this.requestPermissions();
  if (!granted) {
    this.presentAlert();
    return;
  }

  return new Promise(async resolve => {
    document.querySelector('body')?.classList.add('barcode-scanner-active');

    // Таймер, який закриє камеру через 10 секунд
    const timerId = window.setTimeout(async () => {
      console.log('Timeout reached → stopping scan');
      await BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('barcode-scanner-active');
      resolve(null);
    }, 10000);

    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        clearTimeout(timerId); // 🔥 зупиняємо таймер
        await listener.remove();
        await BarcodeScanner.stopScan();
        document.querySelector('body')?.classList.remove('barcode-scanner-active');

        const code = event.barcodes?.[0]?.rawValue ?? null;
		console.log('barcode event: ');
		console.log(event.barcodes);
		console.log('code '+ code);
        if (code) {
          this.checkBarcode(code);
		  this.last_code = code;
        }

        resolve(code);
      }
    );

    await BarcodeScanner.startScan({
      formats: [BarcodeFormat.QrCode],
      lensFacing: LensFacing.Back
    });
  });
};
*/
public scanSingleBarcode = async () => {
  const granted = await this.requestPermissions();
  if (!granted) {
    await this.presentAlert();
    return null;
  }

  document.body.classList.add('barcode-scanner-active');

  return new Promise(async (resolve) => {
    let listener: any = null;

    // Таймаут на 10 секунд
    const timeoutId = setTimeout(async () => {
      console.log('⏳ Timeout → stopping scanner');
      listener && listener(); // правильний спосіб видалення
      // await BarcodeScanner.stopScan();
	  this.stopScan();
      document.body.classList.remove('barcode-scanner-active');
      resolve(null);
    }, 10000);

    listener = BarcodeScanner.addListener('barcodesScanned', async (event) => {
      console.log('📡 Event received:', event);

      clearTimeout(timeoutId);

      listener && listener(); // правильне видалення listener
      await BarcodeScanner.stopScan();
      document.body.classList.remove('barcode-scanner-active');

      const code = event.barcodes?.[0]?.rawValue ?? null;
      if (code) {
        this.checkBarcode(code);
      }

      resolve(code);
    });
	console.log('Starting scan…');
	try {
    await BarcodeScanner.startScan({
      formats: [BarcodeFormat.QrCode],
      lensFacing: LensFacing.Back,
    });
	} catch (err) {
	  console.error("🚨 startScan ERROR:", err);
	}
	console.log('Scan started!');
  });
};


/*Відкрити налаштування застосунку*/
public openSettings() {
  NativeSettings.open({
	  optionAndroid: AndroidSettings.ApplicationDetails,
	  optionIOS: IOSSettings.App
	})
}


  async showToast(msg:any, color:any) {
    if(color == ''){
      color = 'primary';
    }
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top',
      buttons: [],
      color:color
    });
    await toast.present();
  }
  

/*TETS*/
public async scanTestTwo(): Promise<void> {
  
  const granted = await this.requestPermissions();
  if (!granted) {
    await this.presentAlert();
  }
	
  let listener: PluginListenerHandle | undefined;
  const overlay = document.getElementById("scanner-overlay");

  // Показуємо рамку
  overlay?.classList.remove("hidden");
  document.body.classList.add("barcode-scanner-active");

  // Таймаут
  const timeout = setTimeout(async () => {
    console.warn("Scan timeout — stopping");

    await listener?.remove();
    await BarcodeScanner.stopScan();

    overlay?.classList.add("hidden");
    document.body.classList.remove("barcode-scanner-active");
  }, 10000);

  // Listener
  listener = await BarcodeScanner.addListener("barcodesScanned", async (event) => {
    this.ngZone.run(async () => {
      const first = event.barcodes[0];
      if (!first) return;

      clearTimeout(timeout);
      console.log("QR FOUND:", first.rawValue);

      await listener?.remove();
      await BarcodeScanner.stopScan();

      overlay?.classList.add("hidden");
      document.body.classList.remove("barcode-scanner-active");
	
		if(first){
			this.checkBarcode(first.rawValue);
		}
	
      
    });
  });

  // Google module
  const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
  if (!available) {
    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    } catch {}
  }

  // Start scanning
  await BarcodeScanner.startScan();
}

  



  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private platform: Platform,
	private ngZone: NgZone,
  ) { }

  async ngOnInit() {
    this.getApiData();
	
	const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

  }
  

  ionViewWillEnter() {
    this.getApiData();
  }
  
	ionViewDidEnter() {
	  this.backButtonListener = App.addListener('backButton', () => {
		this.stopScan();
	  });
	}

	  
}
