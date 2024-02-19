import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '38', ' ', '0', /\d/, /\d/,' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/,' ', /\d/, /\d/],
  };
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();

  openValidate = false;

  public reg_firstname:string='';
  public reg_lastname:string='';
  public reg_phone:string='';
  public reg_email:string='';
  public reg_password:string='';
  public validate_code:string='';



  register(){
    //validate fields
    let error = '';

    if(this.reg_firstname.length < 3){
      error = 'Поле ім\'я обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(this.reg_lastname.length < 3){
      error = 'Поле прізвище обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(this.reg_phone.length < 3){
      error = 'Поле телефон обов\'язкове до заповнення!';
      this.showToast(error, 'danger');
    }
    if(this.reg_password.length < 6){
      error = 'Мінімальна довжина поля пароль 6 символів!';
      this.showToast(error, 'danger');
    }

    if(!error){
      //do register
      let params = {
        firstname : this.reg_firstname,
        lastname : this.reg_lastname,
        phone : this.reg_phone,
        email : this.reg_email,
        password : this.reg_password,
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=validate_code', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json.error){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          this.storage.set('user_id', json['user_id']);
          this.storage.set('user_md5', json['md5']);
          this.storage.set('session_id', json['session_id']);
          setTimeout(() => {
            this.openValidate = true;
          }, (1500));
        }
      });
    }

    }


  async validateCode(){
    if(!this.validate_code){
      this.showToast('Будь ласка, введіть код', 'danger');
    }else{
      let user_id = await this.storage.get('user_id');
      let params = {
        user_id    : user_id,
        token : await this.storage.get('token'),
        validate_code : this.validate_code,
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=validate_code', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json.error){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          this.storage.set('user_id', json['user_id']);
          this.storage.set('user_md5', json['md5']);
          this.storage.set('token', json['token']);
          this.storage.set('is_active', json['is_active']);
          localStorage.setItem('user_id', json['user_id']);
          localStorage.setItem('token', json['token']);
          localStorage.setItem('is_active', json['is_active']);
          this.openValidate = false;
          setTimeout(() => {
            this.router.navigate(['tab3']);
          }, 1500);
        }
      });
    }
  }

  async resendCodeValidation(){
    let params = {
      user_id    : await this.storage.get('user_id'),
      token      : await this.storage.get('token'),
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=resend_validate_code', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json.error){
        this.showToast(json['error'], 'danger');
      }else{
        this.showToast(json['success'], 'success');
      }
    });
  }

  cancelValidate(){
    this.openValidate = false;
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

  /*
  checkUserAuth(){
    let param = {token:0};
    this.http.post('https://skywater.com.ua/api/index.php?type=my_profile', JSON.stringify(param)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      //console.log(localStorage.getItem('random'));
      //localStorage.setItem('random', Math.floor(Math.random() * 5));
      if(json['not_auth'] && json['not_auth'] == true){
        //this.router.navigate(['auth']);
      }
    });
  }
  */

  constructor(
  private storage: Storage,
  private http: HttpClient,
  private router: Router,
  private toastCtrl: ToastController
) { }

  ngOnInit() {
    this.storage.create();
    console.log(this.storage.get('user_id'));
    localStorage.setItem("token", "1235");
  }


}
