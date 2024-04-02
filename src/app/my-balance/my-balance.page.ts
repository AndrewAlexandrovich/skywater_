import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-my-balance',
  templateUrl: './my-balance.page.html',
  styleUrls: ['./my-balance.page.scss'],
})
export class MyBalancePage implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) { }

  public balance_amount:any = '0 грн.';
  public balance_description:any = '';
  public amount_to_pay:any = '';
  public histories:any = '';
  public show_skeleton = true;
  private temp_balance_id:any=0;

  payToBalance(){

    if(this.amount_to_pay){
      let params = {
          token      : localStorage.getItem('token'),
          user_id    : localStorage.getItem('user_id'),
          amount     : this.amount_to_pay
      };

      this.http.post('https://skywater.com.ua/api/index.php?type=createPaymentBalance', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        if(json.success){
          this.showToast(json.success, 'success');

          if(json.payment_url){
            this.temp_balance_id = json.balance_id;
            Browser.open({ url: json.payment_url, presentationStyle: 'popover' });
            Browser.addListener('browserFinished', () => {
              let param = {balance_id:this.temp_balance_id};
              this.http.post('https://skywater.com.ua/api/index.php?checkPayment=1&balance_id='+this.temp_balance_id, JSON.stringify(param)).subscribe((response2) => {
                let json2 = JSON.parse(JSON.stringify(response2));
                if(json2.success){
                  this.showToast(json2.success, 'success');
                }else if(json2.message){
                  this.showToast(json2.message, 'light');
                }
                this.getData();
                this.amount_to_pay = '';
              });
            });
            // load
            this.getData();
            this.amount_to_pay = '';
          }

        }else if(json.error){
          this.showToast(json.error, 'success');
        }

      });
    }else{
      this.showToast('Будь ласка, вкажіть суму.', 'danger');
    }

  }

  getData(){

    if(!localStorage.getItem('token') && !localStorage.getItem('user_id')){
      this.router.navigate(['auth']);
    }

    let params = {
        token      : localStorage.getItem('token'),
        user_id    : localStorage.getItem('user_id')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getMyBalance', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));

      if(json.balance_amount){

        this.balance_amount = json.balance_amount;
        if(json.balance_description){
          this.balance_description = json.balance_description;
        }

        if(json.histories.length){
          this.histories = json.histories;
          this.show_skeleton = false;
        }

      }else if(json.error){
        this.showToast(json.error, 'danger');
      }

    });
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.getData();
      event.target.complete();
    }, 1500);
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

  ngOnInit() {
    this.getData(); // load data
  }

}
