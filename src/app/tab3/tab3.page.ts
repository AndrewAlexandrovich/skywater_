import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private storage: Storage,
    private alertController: AlertController
  ) { }
  //phone mask
  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '3','8',' ', /\d/,/\d/,/\d/, ' ', /\d/,/\d/,/\d/,' ', /\d/,/\d/, ' ', /\d/,/\d/],
  };
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();

  public customer_name:string = '';
  public myAccountModal = false;
  public showQrModal = false;
  public acc_firstname:string = '';
  public acc_lastname:string = '';
  public acc_phone:string = '';
  public acc_email:string = '';
  public acc_old_password:string = '';
  public acc_password:string = '';
  public qr_url:string = '';
  public customer_id:any = 0;
  public bonus_history_modal:any = false;
  public bonus_history_status:any = true;//
  public bonusHistories:any;//
  public allBonusHistories:any;//
  closeMyAccModal(){
    this.myAccountModal = false;
  }
  closeQrModal(){
    this.showQrModal = false;
  }
  toggleBonusesHistory(status:any){
    if(status == true){
      this.loadBonusHistory();
    }

    this.bonus_history_modal = status;
  }
  getQr(){
    let params = {
      token      : localStorage.getItem('token'),
      user_id    : localStorage.getItem('user_id')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getQr', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['qr_code_path']){
        this.qr_url = json['qr_code_path'];
        this.showQrModal = true;
      }else if(json['error']){
        this.showToast(json['error'], 'warning');
      }
    });
  }
  openMyAccModal(){
    this.myAccountModal = true;
  }
  openAddresses(){
    this.router.navigate(['account-address']);
  }
  openMyBalance(){
    this.router.navigate(['my-balance']);
  }
  updateProfile(){
    //validate
    let error = ''
    if(this.acc_firstname.length < 3){
      error = 'Поле ім\'я обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(this.acc_lastname.length < 3){
      error = 'Поле прізвище обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(this.acc_phone.length < 3){
      error = 'Поле телефон обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(!error){
      let params = {
        firstname : this.acc_firstname,
        lastname : this.acc_lastname,
        phone : this.acc_phone,
        email : this.acc_email,
        old_pwd : this.acc_old_password,
        new_pwd : this.acc_password,
        user_id : localStorage.getItem('user_id'),
        token : localStorage.getItem('token')
      };

      this.http.post('https://skywater.com.ua/api/index.php?type=update_profile', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json['error']){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          this.customer_name = json['name'];
          this.acc_email = json['user_data']['email'];
          this.acc_phone = json['user_data']['phone'];
          this.acc_firstname = json['user_data']['firstname'];
          this.acc_lastname  = json['user_data']['lastname'];
          this.acc_email  = json['user_data']['email'];
          this.myAccountModal = false;
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      });


    }


  }
  async logout(){
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    await this.storage.remove('user_id');
    await this.storage.remove('token');
    this.customer_id = 0;
    this.router.navigate(['auth']);
  }

  openOrdersPage(){
    this.router.navigate(['account-orders']);
  }

  checkUserAuth(){
    let user_id = localStorage.getItem('user_id');
    let token = localStorage.getItem('token');

    let params = {
      user_id    : user_id,
      token      : token
    };

    this.http.post('https://skywater.com.ua/api/index.php?type=my_profile', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      //console.log(localStorage.getItem('random'));
      if(json['not_auth'] && json['not_auth'] == true){
        this.router.navigate(['auth']);
        this.customer_id = 0;
      }else{
        this.customer_name = json['name'];
        this.acc_email = json['user_data']['email'];
        this.acc_phone = json['user_data']['phone'];
        this.acc_firstname = json['user_data']['firstname'];
        this.acc_lastname  = json['user_data']['lastname'];
        this.customer_id = json['user_id'];

        //new history func
        this.bonus_history_status = json['bonus_history_status'];

      }
    });
  }

  loadBonusHistory(){
    let user_id = localStorage.getItem('user_id');
    let token = localStorage.getItem('token');

    let params = {
      user_id    : user_id,
      token      : token
    };

    this.http.post('https://skywater.com.ua/api/index.php?type=loadBonusHistory', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json.error){
        this.showToast(json.error, 'danger');
      }else if(json.results){
        this.bonusHistories = json['results']['bottle'];
        this.allBonusHistories = json.results;
      }

    });
  }
  updateBonusHistory(type:any){
    if(type == 'bottle'){
      this.bonusHistories = this.allBonusHistories['bottle'];
    }else{
      this.bonusHistories = this.allBonusHistories['liter'];
    }
  }

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
  /*deleting account*/

  async toggleAlertRemoveAcc(){

      const alert = await this.alertController.create({
        header: 'Увага!',
        message: 'Ви не зможете відновити свій аккаунт. Вся пов\'язана інформація буде втрачена.',
        buttons: this.alertRemoveAccButtons
      });
      await alert.present();

  }
public alertRemoveAccButtons = [
    {
      text: 'Відміна',
      role: 'cancel',
    },
    {
      text: 'Підтвердити',
      role: 'apply',
      handler: () => {
        this.alertResult(true);
      },
    },
  ];
  alertResult(ev:any){
    if(ev == true){
      //do delete account
      let params = {
        user_id    : localStorage.getItem('user_id'),
        token      : localStorage.getItem('token')
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=removeAccount', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));

        if(json['error']){
          this.showToast(json['error'], 'danger');
        }else if(json['success']){
          this.showToast(json['success'], 'light');
          setTimeout(() => {
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
            this.customer_id = 0;
            this.router.navigate(['auth']);
          }, 2500);
        }
      });
    }
  }
  handleRefresh(event:any) {
    setTimeout(() => {
      this.checkUserAuth();
      event.target.complete();
    }, 1500);
  }
/*deleting account*/
ionChange(){
  this.checkUserAuth();
}
  ionViewWillEnter(){
    this.checkUserAuth();
    if(localStorage.getItem('user_id')){
      this.customer_id = localStorage.getItem('user_id');
    }
  }
  ngOnInit() {
    this.storage.create();
    this.checkUserAuth();
  }
}
