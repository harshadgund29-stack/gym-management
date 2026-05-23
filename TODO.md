# TODO

- [ ] Inspect current membership plan DB schema usage for plans (membership_plans table) and confirm how to add packing_price column.
- [x] Backend: add persistent packingPrice field to MembershipPlan entity + update DTO.

- [x] Backend: update MembershipPlanService.toDTO() and GET /api/plans/active response to include packingPrice + totalAmount.

- [x] Backend: update RazorpayController createOrder() to charge totalAmount (price + packingPrice) and persist Payment amount accordingly.

- [x] Frontend: update MemberPlans.jsx to display packing price and total amount.

- [x] Frontend: enable Razorpay UPI option in MemberPlans.jsx and Checkout.jsx (method: { upi: true, card: true, netbanking: true }).

- [x] Frontend: ensure Razorpay order amount uses backend totalAmount and display uses en-IN INR formatting.

- [x] Backend: update database/schema.sql to include packing_price.

- [ ] Run backend + frontend; smoke test: plans load, checkout opens with UPI, payment success + receipt amount correct (remaining).


