import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-success-order',
  templateUrl: './success-order.page.html',
  styleUrls: ['./success-order.page.scss'],
})
export class SuccessOrderPage implements OnInit {

  public order_id:any = 0;

  goToMyAccount(){
    this.router.navigate(['tabs/tab3']);
  }

  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController,private activatedRoute:ActivatedRoute) { }

  ngOnInit() {
    this.order_id = this.activatedRoute.snapshot.paramMap.get('order_id');
  }

}
