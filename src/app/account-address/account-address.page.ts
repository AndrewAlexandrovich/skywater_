import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss'],
})
export class AccountAddressPage implements OnInit {
  //
  public addr_city:string='';
  public addr_street:string='';
  public addr_number:string='';
  public addr_enterance:string='';
  public addr_floor:string='';
  public addr_ap_number:string='';
  public addr_domofone_code:string='';
  public addr_is_default = false;
  public cities_array:any;

  public edit_address_id = 0;

  public addresses:any;
  public showEmptyMsg = true;
  public addressModal = false;
  public modal_title:string = 'Моя адреса';

  getCities(){
    let params = {};
    this.http.post('https://skywater.com.ua/api/index.php?type=get_cities', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else{
        this.cities_array = json['cities'];
      }
    });
  }
  getAddresses(){
    let params = {
      user_id : localStorage.getItem('user_id'),
      token   : localStorage.getItem('token')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=get_addresses', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      console.log(json);
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else{
        if(json['addresses']){
          this.addresses = json['addresses'];
          this.showEmptyMsg = false;
          console.log(this.addresses);
        }else{
          this.showEmptyMsg = true;
        }
      }
    });
  }
  sendAddressToApi(){
    //validate
    let error = '';
    if(this.addr_city.length < 3){
      error = 'Оберіть місто';
      this.showToast(error, 'danger');
    }
    if(this.addr_street.length < 3){
      error = 'Введіть назву вулиці';
      this.showToast(error, 'danger');
    }
    if(this.addr_number == ''){
      error = 'Введіть номер будинку';
      this.showToast(error, 'danger');
    }

    if(!error){
      let params = {
        city : this.addr_city,
        number : this.addr_number,
        street : this.addr_street,
        enterance : this.addr_enterance,
        floor : this.addr_floor,
        domofone_code : this.addr_domofone_code,
        ap_number : this.addr_ap_number,
        is_default : this.addr_is_default,
        address_id : this.edit_address_id,
        user_id : localStorage.getItem('user_id'),
        token : localStorage.getItem('token'),
      };

      let api_link = 'https://skywater.com.ua/api/index.php?type=add_address';
      if(this.edit_address_id > 0){
        api_link = 'https://skywater.com.ua/api/index.php?type=edit_address';
      }
      this.http.post(api_link, JSON.stringify(params)).subscribe((response) => {
        let json = JSON.parse(JSON.stringify(response));
        console.log(json);
        if(json['error']){
          this.showToast(json['error'], 'danger');
        }else{
          this.showToast(json['success'], 'success');
          this.getAddresses();
          this.addressModal = false;
        }
      });

    }
  }
  addAddress(){
    this.addr_city='';
    this.addr_street='';
    this.addr_number='';
    this.addr_enterance='';
    this.addr_floor='';
    this.addr_ap_number='';
    this.addr_domofone_code='';
    this.addr_is_default = false;
    this.edit_address_id = 0;
    this.getCities();
    this.addressModal = true;
    this.modal_title = 'Додати адресу';
  }
  editAddress(address_id:any){
    this.modal_title = 'Редагувати адресу';

    for(let addr of this.addresses){
      if(addr.address_id == address_id){
        this.addr_city=addr.city;
        this.addr_street=addr.street;
        this.addr_number=addr.number;
        this.addr_enterance=addr.enterance;
        this.addr_floor=addr.floor;
        this.addr_ap_number=addr.ap_number;
        this.addr_domofone_code=addr.domofone_code;
        if(addr.is_default){
          this.addr_is_default = true;
        }else{
          this.addr_is_default = false;
        }
      }
    }
    this.edit_address_id = address_id;
    this.addressModal = true;

  }
  removeAddress(address_id:any){
    if(address_id){
        let params = {
            address_id : address_id,
            token : localStorage.getItem('token'),
            user_id : localStorage.getItem('user_id')
        };
        this.http.post('https://skywater.com.ua/api/index.php?type=delete_address', JSON.stringify(params)).subscribe((response) => {
          let json = JSON.parse(JSON.stringify(response));
          console.log(json);
          if(json['error']){
            this.showToast(json['error'], 'danger');
          }else{
            this.showToast(json['success'], 'success');
            this.getAddresses();
          }
        });
    }
  }

  addressModalHide(){
    this.addressModal = false;
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
    this.getCities();
    this.getAddresses();
  }

}
