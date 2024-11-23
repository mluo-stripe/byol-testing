const stripe = require('stripe')('sk_test_51QF6p2G645UW4yY1lm2PmBguPhTpiS8CiRvffnt7OdJvBKe25HFjiQcxUIttmXa1ZNKxxLJCWsRMEwFy8SRs3cC300690ZmbNs');

async function advanceTestClock(testClockId, daysToAdvance) {
  try {
    let remainingDays = daysToAdvance;

    while (remainingDays > 0) {
      // Determine how many days we can advance in this step
      const step = Math.min(remainingDays, 60); // Max 2 months (60 days) for monthly subscriptions
      const currentTime = Math.floor(Date.now() / 1000); // Current timestamp

      // Advance the test clock
      const testClock = await stripe.testHelpers.testClocks.advance(testClockId, {
        frozen_time: currentTime + step * 24 * 60 * 60, // Advance by `step` days
      });

      console.log(`Advanced test clock by ${step} days. Current frozen time: ${new Date(testClock.frozen_time * 1000)}`);
      remainingDays -= step;

      // Wait for Stripe to process the advancement
      if (testClock.status === 'advancing') {
        console.log('Waiting for Stripe to process the advancement...');
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
      }
    }

    console.log('Test clock advanced successfully!');
  } catch (error) {
    console.error('Error advancing test clock:', error);
  }
}

// Replace with your Test Clock ID and desired number of days to advance
advanceTestClock('clock_1QNiQsG645UW4yY1KFlzm3Zc', 180);