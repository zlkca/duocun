import { Component, OnInit } from '@angular/core';
import * as Stripe from 'stripe';

@Component({
  selector: 'app-payment-form-page',
  templateUrl: './payment-form-page.component.html',
  styleUrls: ['./payment-form-page.component.scss']
})
export class PaymentFormPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    const elements = stripe.elements();
    // Custom styling can be passed to options when creating an Element.
    const style = {
      base: {
        // Add your base input styles here. For example:
        fontSize: '16px',
        color: '#32325d',
      },
    };

    // Create an instance of the card Element.
    const card = elements.create('card', {style});

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    card.addEventListener('change', ({error}) => {
      const displayError = document.getElementById('card-errors');
      if (error) {
        displayError.textContent = error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

}
