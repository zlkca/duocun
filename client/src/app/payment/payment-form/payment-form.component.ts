import { Component, OnInit, OnDestroy } from '@angular/core';


import { PaymentService } from '../payment.service';
// import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';

// import { environment } from '../../../environments/environment';
// declare var Stripe;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  stripe;
  card;
  private onDestroy$ = new Subject();

  constructor(private paymentSvc: PaymentService) {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    // this.stripe = Stripe(environment.STRIPE.API_KEY);
    // const elements = this.stripe.elements();

    // // Custom styling can be passed to options when creating an Element.
    // const style = {
    //   base: {
    //     color: '#32325d',
    //     fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //     fontSmoothing: 'antialiased',
    //     fontSize: '16px',
    //     '::placeholder': {
    //       color: '#aab7c4'
    //     }
    //   },
    //   invalid: {
    //     color: '#fa755a',
    //     iconColor: '#fa755a'
    //   }
    // };

    // // Create an instance of the card Element.
    // this.card = elements.create(PaymentMethod.CREDIT_CARD, { style });

    // // Add an instance of the card Element into the `card-element` <div>.
    // this.card.mount('#card-element');

    // // Handle real-time validation errors from the card Element.
    // this.card.addEventListener('change', function (event) {
    //   const displayError = document.getElementById('card-errors');
    //   if (event.error) {
    //     displayError.textContent = event.error.message;
    //   } else {
    //     displayError.textContent = '';
    //   }
    // });
  }

  onSubmit() {
    // const self = this;
    // this.stripe.createToken(this.card).then(function (result) {
    //   if (result.error) {
    //     // Inform the user if there was an error.
    //     const errorElement = document.getElementById('card-errors');
    //     errorElement.textContent = result.error.message;
    //   } else {
    //     // Send the token to your server.
    //     // stripeTokenHandler(result.token);
    //     // self.paymentSvc.charge(order, result.token, 'stripeToken').pipe(takeUntil(self.onDestroy$)).subscribe(x => {
    //     //   const k = x;
    //     // });
    //   }
    // });
  }
}
