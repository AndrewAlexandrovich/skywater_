import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  public showEmptyMsg = true;
  public products:any;
  public addresses:any;
  public payments:any='';
  public defaultAddressId:any = 0;
  public show_add_address = false;
  public payment_id = 0;
  public shipping_id = 0;
  public payment_method_checked:any;
  public shippings:any;
  public shipping_method_checked:any;
  public disablePaymentButton:any = true;
  public totals:any = '';

  processPayment(){

  }

  getTotal(){

    if(this.shipping_id && this.payment_id){

    let params = {
      token        : localStorage.getItem('token'),
      user_id      : localStorage.getItem('user_id'),
      shipping_id  : this.shipping_id,
      payment_id   : this.payment_id
    };

    this.http.post('https://skywater.com.ua/api/index.php?type=getCartTotal', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['error']){
        this.showToast(json['error'], 'danger');

        this.totals = '';
        this.disablePaymentButton = true;

      }else if(json['totals']){
        this.totals = json['totals'];
        this.products = json['products'];
        this.disablePaymentButton = false;
      }
    });
    }

  }


  isDefaultAddress(addressId:any){
    if(addressId == this.defaultAddressId){
      return true;
    }else{
      return false;
    }
  }
  changePayment(payment_id:any){
    this.payment_id = payment_id;
    let temp_payments = this.payments;
    this.payments = '';
    setTimeout(() => {
      this.payments = temp_payments;
    }, 250);
  }
  isSelectedPayment(payment_id:any){
    if(payment_id == this.payment_id){
      return true;
    }else{
      return false;
    }
  }
  changeShipping(shipping_id:any){
    this.shipping_id = shipping_id;
    let temp_shippings = this.shippings;
    this.shippings = '';
    this.getTotal();
    setTimeout(() => {
      this.shippings = temp_shippings;
    }, 250);
  }
  isSelectedShipping(shipping_id:any){
    if(shipping_id == this.shipping_id){
      return true;
    }else{
      return false;
    }
  }

  changeDefaultAddress(address_id:any){
    this.defaultAddressId = address_id;
  }

  addAddress(){
    this.router.navigate(['account-address']);
  }

  getCart(){

    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getCart', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['products']){
        this.products = json['products'];
        this.showEmptyMsg = false;
        if(json['addresses']){
            this.addresses = json['addresses'];
            if(this.defaultAddressId == 0){
              this.defaultAddressId = json['default_address_id'];
            }
        }
        if(json['payments']){
            this.payments = json['payments'];
        }
        if(json['shippings']){
            this.shippings = json['shippings'];
        }
        if(!json['addresses'].length){
          this.show_add_address = true;
        }


      }else if(!json['products']){
        this.showEmptyMsg = true;
      }
    });

  }

  removeProduct(product_id:any){
    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id'),
        product_id : product_id,
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=removeProduct', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['success']){
        this.showToast(json['success'], 'success');
        this.getCart();
        this.getTotal();
      }
    });
  }

  updateQuantity(product_id:any, symb:any){
    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id'),
        product_id : product_id,
        symb : symb
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=updateCartProduct', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['success']){
        //this.showToast(json['success'], 'success');
        this.getCart();
        this.getTotal();
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

  handleRefresh(event:any) {
    setTimeout(() => {
      this.getCart();
      event.target.complete();
    }, 1500);
  }


  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController) { }

  ngOnInit() {
    this.getCart();
  }

}
