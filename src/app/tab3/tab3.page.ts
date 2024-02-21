import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController,private storage: Storage) { }

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
  closeMyAccModal(){
    this.myAccountModal = false;
  }
  closeQrModal(){
    this.showQrModal = false;
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
    this.router.navigate(['auth']);
  }

  openOrdersPage(){
    this.router.navigate(['account-orders']);
  }

  async checkUserAuth(){
    let user_id = await this.storage.get('user_id');
    let token = await this.storage.get('token');
    if(!user_id){
      user_id = localStorage.getItem('user_id');
    }
    if(!token){
      token = localStorage.getItem('token');
    }
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
      }else{
        this.customer_name = json['name'];
        this.acc_email = json['user_data']['email'];
        this.acc_phone = json['user_data']['phone'];
        this.acc_firstname = json['user_data']['firstname'];
        this.acc_lastname  = json['user_data']['lastname'];
      }
    });
  }

  async showToast(msg:any, color:any) {
    console.log('start show');
    if(color == ''){
      color = 'primary';
    }
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      buttons: [],
      color:color
    });
    await toast.present();
}
/*deleting account*/
public alertRemoveAccButtons = [
    {
      text: 'Відміна',
      role: 'cancel',
    },
    {
      text: 'Підтвердити',
      role: 'apply',
    },
  ];
  alertResult(ev:any){
    console.log(ev.detail.role);
    if(ev.detail.role == 'apply'){
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
            /*
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
            await this.storage.remove('user_id');
            await this.storage.remove('token');
            this.router.navigate(['auth']);
            */
            console.log('redirect');
          }, 2500);
        }
      });
    }
  }
/*deleting account*/

  ngOnInit() {
    this.storage.create();
    this.checkUserAuth();
  }
}
