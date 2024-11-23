// This is your test secret API key.
const stripe = require('stripe')('sk_test_51QF6p2G645UW4yY1lm2PmBguPhTpiS8CiRvffnt7OdJvBKe25HFjiQcxUIttmXa1ZNKxxLJCWsRMEwFy8SRs3cC300690ZmbNs', {
  apiVersion: '2024-09-30.acacia; checkout_server_update_beta=v1',
});
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors()); // Enable CORS for all origins
app.use(express.static('public'));
app.use(express.json());

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      permissions: {
        update: {
          line_items: 'server_only',
        }
      },
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1QO5MWG645UW4yY1ts3iu1Tm',
          quantity: 1,
          
          adjustable_quantity: {
            enabled: true, // Enable adjustable quantity
            minimum: 1,   // Minimum quantity allowed
            maximum: 10,  // Maximum quantity allowed
          },
        },
      ],
      mode: 'payment', // Required for subscriptions
    
      return_url: `${YOUR_DOMAIN}/success.html`,
      // cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    console.log(session.id)
    res.json({
      clientSecret: session.client_secret,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Internal Server Error');
  }
});

function validateLineItems(lineItems) {
  // Implement this function to validate the line items the customer has entered.
  return true
}

function recomputeLineItems(lineItems, session) {
  // Implement this function to recompute the customer's new line items based on
  // the line item updates they made in the Checkout UI.
  return true
}

app.post('/update-line-items', async (req, res) => {
  console.log("Enter update-line-items")
  console.log(req.body)
  const {checkout_session_id, line_items} = req.body;

  // 1. Retrieve the Checkout Session
  const session = await stripe.checkout.sessions.retrieve(checkout_session_id,
    {
      // Line items are not included on the API resource by default unless expanded
      expand: ['line_items']
    }
  );

  // 2. Validate the line items
  if (!validateLineItems(line_items)) {
    return res.json({type: 'error', message: 'Your line items are invalid. Please refresh your session.'});
  }

  // 3. Recompute the line items
  const lineItems = recomputeLineItems(line_items, session);
  console.log("lineItems " + lineItems)
  // 4. Update the Checkout Session with the new line items
  if (lineItems) {
    console.log("Enter lineItems")
    await stripe.checkout.sessions.update(checkout_session_id, {
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1QO5MWG645UW4yY1ts3iu1Tm',
          quantity: 10,
        },
      ],
    });

    return res.json({type:'object', value: {succeeded: true}});
  } else {
    return res.json({type:'error', message: "We could not update your line items. Please try again."});
  }
});

app.listen(4242, () => console.log('Running on port 4242'));