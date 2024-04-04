import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

	public cart_count = 0;
	public chat_count = 0;

	getStat(){

		if(localStorage.getItem('token')){
			let params = {
				token : localStorage.getItem('token'),
				user_id : localStorage.getItem('user_id')
			};
			this.http.post('https://skywater.com.ua/api/index.php?type=getTabStat', JSON.stringify(params)).subscribe((response) => {
			  let json = JSON.parse(JSON.stringify(response));

			  if(json['cart_count'] >= 0){
				this.cart_count = json['cart_count'];
			  }

			  if(json['chat_count'] >= 0){
				  this.chat_count = json['chat_count'];
        }else{
          this.chat_count = 0
        }

        if(json['notification']){
          if(json['notification']['message']){
            let color = '';
            if(json['notification']['color']){
              color = json['notification']['color'];
            }
            let timer = 3000;
            if(json['notification']['timer']){
              timer = json['notification']['timer'];
            }

            this.showToast(json['notification']['message'], color, timer);
          }
        }

			});

		}else{
      this.cart_count = 0;
      this.chat_count = 0;
    }
	}


  async showToast(msg:any, color:any, timer:any) {
    console.log('start show');
    if(color == ''){
      color = 'primary';
    }
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: timer,
      position: 'top',
      buttons: [],
      color:color
    });
    await toast.present();
  }


	public inteval = setInterval(() => {
         this.getStat();
    }, 10000);


  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
	   this.getStat();
     this.inteval;
  }
}
