import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var Stripe;
@Component({
  selector: 'app-credit-card-form',
  templateUrl: './credit-card-form.component.html',
  styleUrls: ['./credit-card-form.component.scss']
})
export class CreditCardFormComponent implements OnInit {
  @Output() init = new EventEmitter();
  constructor() { }

  ngOnInit() {
    const {stripe, card} = this.initStripe('card-element', 'payment-result');
    this.init.emit({stripe, card});
  }

  initStripe(htmlCardId, htmlErrorId) {
    const stripe = Stripe(environment.STRIPE.API_KEY);
    const elements = stripe.elements();
    const type = 'card';

    // Custom styling can be passed to options when creating an Element.
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    const card = elements.create(type, { hidePostalCode: true, style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#' + htmlCardId);

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function (event) {
      const displayError = document.getElementById(htmlErrorId);
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    return { stripe, card };
  }
}
