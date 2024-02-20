import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  public empty_msg = true;
  public not_auth = true;
  public messages:any;
  public text:any = '';

  sendMsg(){
    if(this.text){
      let params = {
        user_id : localStorage.getItem('user_id'),
        token   : localStorage.getItem('token'),
        text    : this.text
      };
      this.http.post('https://skywater.com.ua/api/index.php?type=addChatMsg', JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        if(json['error']){
          this.showToast(json['error'], 'danger');
        }else if(json['total_msg'] > 0){
          this.messages = json['messages'];
          this.empty_msg = false;
          this.text = '';

        }
      });

    }
  }
  getMessages(){
    let params = {
      user_id : localStorage.getItem('user_id'),
      token   : localStorage.getItem('token')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getLastMsgChat', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['total_msg'] > 0){
        this.messages = json['messages'];
        this.empty_msg = false;
      }
    });

  }
//page refresh
  handleRefresh(event:any) {
    setTimeout(() => {
      this.getMessages();
      event.target.complete();
    }, 1500);
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

  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController) { }

  ngOnInit() {
    if(localStorage.getItem('user_id')){
      this.getMessages();
      this.not_auth = false;
    }
  }

}
