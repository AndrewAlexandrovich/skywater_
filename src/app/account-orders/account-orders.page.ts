import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-account-orders',
  templateUrl: './account-orders.page.html',
  styleUrls: ['./account-orders.page.scss'],
})
export class AccountOrdersPage implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private platform: Platform
  ) { }

  public showEmptyMsg = true;
  public my_orders:any;
  public modal_title:any='';
  public order_modal_status = false;
  // order modal data
  public shipping_address:any;
  public shipping_method:any;
  public payment_method:any;
  public totals:any;
  public order_status_name:any;
  public order_status_color:any;
  public comment:any;
  public products:any;
  public history:any;
  public order_id:any;
  public date_added:any;
  public customer_name:any;
  public zastava:any = false;
  public zastava_cost:any = 0;
  public date_and_time:any;
  public is_bezkont:any;

  public show_skeleton:any=true;

  hideModalOrder(){
    this.order_modal_status = false;
    this.show_skeleton = true;
  }
  getOrder(order_id:any){
    this.show_skeleton = true;
    this.order_modal_status = true;//open modal
    //clear variables
    this.shipping_address = '';
    this.shipping_method = '';
    this.payment_method = '';
    this.date_added = '';
    this.customer_name = '';
    this.comment = '';
    this.products = '';
    this.order_status_name = '';
    this.order_status_color = '';
    this.history = '';
    this.totals = '';
    this.order_id = '';
    this.zastava_cost = '';
    this.is_bezkont = '';
    let params = {
      order_id : order_id,
      user_id  : localStorage.getItem('user_id'),
      token    : localStorage.getItem('token')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=get_order', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['error']){
        this.showToast(json['error'], 'danger');
        this.order_modal_status = false;
      }else{
        this.shipping_address = json['shipping_address'];
        this.shipping_method = json['shipping_method'];
        this.payment_method = json['payment_method'];
        this.date_added = json['date_added'];
        this.customer_name = json['customer_name'];
        this.comment = json['comment'];
        this.products = json['products'];
        this.order_status_name = json['order_status_name'];
        this.order_status_color = json['order_status_color'];
        this.history = json['history'];
        this.totals = json['totals'];
        this.order_id = order_id;
        this.zastava_cost = json['zastava_cost']+' грн.';
        this.is_bezkont = json['bezkontakt'];
        if(json['date_and_time']){
          this.date_and_time = json['date_and_time'];
        }
        if(json['zastava']){
          this.zastava = json['zastava'];
        }else{
          this.zastava = false;
        }

        this.modal_title = 'Замовлення №'+order_id;
        this.order_modal_status = true;
        this.show_skeleton = false;
      }
    });



  }
  getOrders(){
    let params = {
      user_id : localStorage.getItem('user_id'),
      token   : localStorage.getItem('token')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=get_orders', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['orders'] && json['orders'].length){
        this.showEmptyMsg = false;
        this.my_orders    = json['orders'];
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
      position: 'top',
      buttons: [],
      color:color
    });
    await toast.present();
}

  ngOnInit() {
    this.getOrders();

    this.platform.backButton.subscribeWithPriority(5, () => {
      this.order_modal_status = false;
    });

  }

}
