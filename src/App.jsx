import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {loadStripe} from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
  } from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51QF6p2G645UW4yY1qJbwb3L0Soq6LNxqm0cAavjhmc6y4nkaX6qfxysOjLInJY9MjQ5JtnvFStJr5IYhGengOmM400ZVJoodlg', {
  betas: ['embedded_checkout_byol_beta_1']
});

const ProductDisplay = () => (
  <section>
    <div className="product">
      <img
        src="https://i.imgur.com/EHyR2nP.png"
        alt="The cover of Stubborn Attachments"
      />
      <div className="description">
      <h3>Stubborn Attachments</h3>
      <h5>$20.00</h5>
      </div>
    </div>
    <form action="http://localhost:4242/create-checkout-session" method="POST">
      <button type="submit">
        Blarg
      </button>
    </form>
  </section>
);

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function App() {
    const fetchClientSecret = useCallback(() => {
        // Create a Checkout Session
        return fetch("http://localhost:4242/create-checkout-session", {
          method: "POST",
        })
          .then((res) => res.json())
          .then((data) => {
            // Log the clientSecret and checkoutSessionId
            console.log("Client Secret:", data.clientSecret);
            console.log("Checkout Session ID:", data.checkoutSessionId);
            onLineItemsChange({checkoutSessionId:data.checkoutSessionId, lineItems:[]})
            return data.clientSecret
          });
      }, []);
    
      // Call your backend to update line items
      const onLineItemsChange = async (lineItemsChangeEvent) => {
        const {checkoutSessionId, lineItems} = lineItemsChangeEvent;
        console.log("Calling onLineItemsChange")
        console.log(checkoutSessionId)
        const response = await fetch("http://localhost:4242/update-line-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Specify JSON content type
          },
          body: JSON.stringify({
            checkout_session_id: checkoutSessionId,
            line_items: lineItems,
          })
        })
        console.log(response)
        if (response.type === 'error') {
          return Promise.resolve({type: "reject", errorMessage: response.message});
        } else {
          return Promise.resolve({type: "accept"});
        }
      };
    
      const options = {fetchClientSecret, onLineItemsChange};
    
      return (
        <div id="checkout">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={options}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )
}