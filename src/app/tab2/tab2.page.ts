import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
//barcode
import { Barcode, BarcodeScanner, BarcodeFormat, LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public isSupported = false;

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
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
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
public scanSingleBarcode = async () => {
  //check permission
  const granted = await this.requestPermissions();
  if (!granted) {
    this.presentAlert();
    return;
  }
  //запустити таймер на 10 сек, щоб закрити камеру
  this.closeCameraAfterTenSec;

  return new Promise(async resolve => {
    document.querySelector('body')?.classList.add('barcode-scanner-active');

    const listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      async result => {
        await listener.remove();
        document.querySelector('body')?.classList.remove('barcode-scanner-active');
        await BarcodeScanner.stopScan();
        this.stopScan(); // stop scan
        this.checkBarcode(result.barcode);
        resolve(result.barcode);
      },
    );

    await BarcodeScanner.startScan({formats:[BarcodeFormat.QrCode], lensFacing:LensFacing.Back});
  });
};

/*Відкрити налаштування застосунку*/
public openSettings = async () => {
  this.showToast('Open setting ', 'light');
  await BarcodeScanner.openSettings();
};
/*Зупинити камеру через 10 секунд*/

public closeCameraAfterTenSec = setTimeout(() => {
  this.stopScan();
}, 10000);


  async showToast(msg:any, color:any) {
    console.log('start show');
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


  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.getApiData();
    //check platform
    BarcodeScanner.isSupported().then((result) => {
        this.isSupported = result.supported;
    });

    this.platform.backButton.subscribeWithPriority(5, () => {
      this.stopScan();
    });
  }

  ionViewWillEnter() {
    this.getApiData();
  }
}
