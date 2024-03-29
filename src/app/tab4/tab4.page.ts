import { Component, OnInit, ViewChild  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { ToastController, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  @ViewChild(IonContent) content:any = IonContent;

  public empty_msg = true;
  public not_auth = true;
  public messages:any = '';
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
          if(this.messages == ''){
            this.messages = json['messages'];
          }else{
            let keys = [];
            for(let item of this.messages){
              keys.push(item['chat_id']);
            }
            for(let item of json['messages']){
              if(!keys.includes(item['chat_id'])){
                this.messages.push(item);
              }
            }
          }
          this.empty_msg = false;
          this.text = '';
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 150);
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
        if(this.messages == ''){
          this.messages = json['messages'];
        }else{
          let keys = [];
          for(let item of this.messages){
            keys.push(item['chat_id']);
          }
          for(let item of json['messages']){
            if(!keys.includes(item['chat_id'])){
              this.messages.push(item);
            }
          }
        }
        this.empty_msg = false;
        setTimeout(() => {
          this.content.scrollToBottom(500);
        }, 150);
      }
    });
  }

//page refresh
  handleRefresh(event:any) {
    setTimeout(() => {
      this.messages == '';
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
      position: 'top',
      buttons: [],
      color:color
    });
    await toast.present();
  }

  public intevalGetMessages = setInterval(() => {
    if(this.router.url != '/tabs/tab4'){
      clearInterval(this.intevalGetMessages);
    }
    this.getMessages();
  }, 10000);

  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController, private activatedRoute:ActivatedRoute) { }

  ionViewWillEnter(){
    if(localStorage.getItem('user_id')){
      this.getMessages();
      this.not_auth = false;

      if(this.router.url == '/tabs/tab4'){
        setTimeout(() => {
          this.intevalGetMessages;
        }, 15000);
      }

    }
  }

  ngOnInit() {
    if(localStorage.getItem('user_id')){
      this.getMessages();
      this.not_auth = false;

      if(this.router.url == '/tabs/tab4'){
        setTimeout(() => {
          this.intevalGetMessages;
        }, 15000);
      }

    }
  }

}
