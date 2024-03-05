import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  openModal = false;
  setForgotmodalStatus(status:any){
    this.openModal = status;
  }

  public auth_phone:string = '';
  public auth_password:string = '';
  public restore_phone:string = '';

  closeAuth(){
    this.router.navigate(['tabs/tab1']);
  }
  signupPage(){
    //go to register page
    	this.router.navigate(['register']);
  }
  sendNewPassword(){
    //go to forgotPassword

    if(this.restore_phone.length < 5){
      this.showToast('Поле телефон обов\'язкове до заповнення', 'error');
    }else{
      let params = {
        'phone' : this.restore_phone,
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=_restore_pass', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json.error){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          localStorage.setItem('user_id', json['user_id']);
          localStorage.setItem('token', json['token']);
          setTimeout(() => {
            this.openModal = false;
          }, (1500));
        }
      });
    }


  }
  login(){
    //login
    let error = false;
    if(this.auth_phone.length < 5){
      this.showToast('Введіть свій телефон', 'danger');
      error = true;
    }
    if(this.auth_password.length < 5){
      this.showToast('Пароль занадто короткий', 'danger');
      error = true;
    }

    if(!error){
      let params = {
        'phone' : this.auth_phone,
        'pass'  : this.auth_password
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=_login', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json.error){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          localStorage.setItem('user_id', json['user_id']);
          localStorage.setItem('token', json['token']);
          setTimeout(() => {
            //window.location.reload();
            this.router.navigate(['tabs/tab3']);
          }, (1500));
        }
      });

    }

  }

  async showToast(msg:any, color:any) {
    console.log('start show');
    if(color == ''){
      color = 'primary';
    }
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      buttons: [],
      color:color
    });
    await toast.present();
}

  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController, private storage: Storage) { }

  ngOnInit() {
    this.storage.create();
  }

}
