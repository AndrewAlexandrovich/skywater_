import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

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


  public time_periods:any = false;
  public selected_date_and_time:any = '';
  public modal_picker_status = false;
  public selectedDate:any = new Date().toISOString();
  public selectedTime:any='';
  public comment:any='';
  public is_no_contact:boolean = false;
  public is_no_call:boolean = false;
  public is_zastava:boolean = false;

  public zastava_status:boolean = false;
  public zastava_data:any;
  public zastava_qty:any = 1;
  public zastava_total:any = 0;
  public zastava_modal:any = 0;

  zastavaModalStatus(newstatus:any){
    this.zastava_modal = newstatus;
  }

  updateZasatava(symb:any){
    if(symb == '+'){
      this.zastava_qty++;
    }else{
      this.zastava_qty--;
      if(this.zastava_qty < 1){
        this.zastava_qty = 1;
      }
    }
    this.getTotal(); // if user select zastava after
    this.zastava_total = (this.zastava_qty * this.zastava_data['cost'])+ ' грн';
  }

  noContactShipping(){
    if(this.is_no_contact == false){
      this.is_no_contact = true;
    }else{
      this.is_no_contact = false;
    }
  }
  noCall(){
    if(this.is_no_call == false){
      this.is_no_call = true;
    }else{
      this.is_no_call = false;
    }
  }
  zastavaTrigger(){
    if(this.is_zastava == false){
      this.is_zastava = true;
    }else{
      this.is_zastava = false;
    }
    this.getTotal(); // if user select zastava after
  }

  closeModalPicker(){
    this.modal_picker_status = false;
  }

  validateCheckout(){
    if(!this.shipping_id){
      this.showToast('Оберіть метод доставки','danger');
      return false;
    }
    if(!this.payment_id){
      this.showToast('Оберіть метод оплати','danger');
      return false;
    }
    return true;
  }

  processPayment(){
    //validate
    if(this.validateCheckout()){
      let order = {
        payment_id    : this.payment_id,
        shipping_id   : this.shipping_id,
        is_no_contact : this.is_no_contact,
        is_no_call    : this.is_no_call,
        comment       : this.comment,
        zastava       : (this.is_zastava == true) ? this.zastava_qty : 0,
        delivery_time : this.selectedTime,
        delivery_date : this.selectedDate,
        address_id     : this.defaultAddressId,
        user_id       : localStorage.getItem('user_id'),
        token         : localStorage.getItem('token'),
      };

      this.http.post('https://skywater.com.ua/api/index.php?type=addOrder', JSON.stringify(order)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        if(json.error){
          this.showToast(json.error, 'danger');
        }else{
          //ok do
          if(json.in_app){
            //do inapp browser
              if(json.in_app['msg']){
                this.showToast(json.in_app['msg'], 'light');
              }

              if(json.in_app['link']){
                //open inapp browser
                //this.showToast('DEBUG: відкриття браузреа', 'light');
                Browser.open({ url: json.in_app['link'], presentationStyle: 'popover' });
                Browser.addListener('browserFinished', () => {
                  //this.showToast('DEBUG: закриття', 'light');
                  //send request to check payment
                  let param = {order_id:json.order_id};
                  this.http.post('https://skywater.com.ua/api/index.php?checkPayment=1&order_id='+json.order_id, JSON.stringify(param)).subscribe((response2) => {
                    let json2 = JSON.parse(JSON.stringify(response2));

                    if(json2.success){
                      this.showToast(json2.success, 'success');
                      this.getCart();
                      this.router.navigate(['success-order',{order_id:json.order_id}])
                    }else{
                      this.showToast(json2.message, 'light');
                      this.getCart();
                    }

                  });
                });
                //start check order status

              }

            }
          if(json.success){
              this.showToast(json.success, 'success');
              this.getCart();
              this.router.navigate(['success-order',{order_id:json.order_id}])
          }
          //update cart page
          this.getCart();
          }
      });


    }
  }

  saveDateAndTime(){
    let defaultFormat = this.selectedDate.split('T')[0];
    defaultFormat = defaultFormat.split('-');
    defaultFormat = defaultFormat['2']+'.'+defaultFormat['1']+'.'+defaultFormat['0'];
    this.selected_date_and_time = defaultFormat+' '+this.selectedTime;
    this.modal_picker_status = false;
  }
  setDateAndTime(){
    this.modal_picker_status = true;
  }

  getTotal(){

    if(this.shipping_id && this.payment_id){

    let params = {
      token        : localStorage.getItem('token'),
      user_id      : localStorage.getItem('user_id'),
      shipping_id  : this.shipping_id,
      payment_id   : this.payment_id,
      zastava_qty    : this.zastava_qty,
      is_zastava     : this.is_zastava,
      is_no_call     : this.is_no_call,
      is_no_contact  : this.is_no_contact
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
    this.getTotal();
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
        if(!localStorage.getItem('user_id')){
            this.showEmptyMsg = true;
        }
      }else if(json['products'].length){
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
        if(json['default_shipping_id'] != ''){
            this.shipping_id = json['default_shipping_id'];
        }else{
           this.showToast('Оберіть адресу', 'danger');
        }

        if(!json['addresses'].length){
          this.show_add_address = true;
        }
        if(json['time_period']){
          this.time_periods = json['time_period'];
        }
        if(json['zastava_data']){
          this.zastava_status = true;
          this.zastava_data = json['zastava_data'];
          this.zastava_total = json['zastava_data']['cost']+' грн';
        }


      }else if(json['products']){
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


  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ionViewWillEnter(){
    this.getCart();
  }
  ngOnInit() {
    this.getCart();
  }

}
