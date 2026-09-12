# Customer portal

Covers items 2 and 3 on the task list: booking, and loyalty points with
redemption.

Pages, all under `/customer` and reachable only by an account whose
`accountType` is `Customer`:

| Route                 | Page           | What it does                                            |
| --------------------- | -------------- | ------------------------------------------------------- |
| `/customer`           | Dashboard      | Next visit, upcoming and completed counts, points balance |
| `/customer/book`      | Book a service | Pick service, date, time slot, address                  |
| `/customer/bookings`  | My bookings    | Filter by status, cancel a booking not yet started      |
| `/customer/loyalty`   | Loyalty points | Balance, redemption tiers, vouchers, earning history    |

It runs on dummy data today. Sign in as `customer` / `password123`.

## What the backend still needs

Two of the six endpoints the portal uses already exist. Each call in
`src/api/customerApi.js` is marked `EXISTS` or `NOT BUILT YET`, and the mock
serves whichever is missing, so the pages work either way.

Already built:

- `GET /api/bookings/services`
- `POST /api/bookings`

Still needed:

| Endpoint | Why |
| --- | --- |
| `GET /api/customers/me` | A customer cannot see their own `customer_ID` (see below) |
| `GET /api/bookings/my?customer_ID=` | Nothing returns a customer's own bookings |
| `PUT /api/bookings/:id/cancel` | Cancelling only changes `status`, but no route does it |
| `GET /api/customers/:id/loyalty` | Balance and earning history |
| `POST /api/customers/:id/loyalty/redeem` | Spend points, issue a voucher |

### The customer_ID problem — worth fixing first

`POST /api/bookings` requires `customer_ID`. But logging in returns only:

```json
{ "user_ID": 1, "username": "...", "accountType": "Customer" }
```

`user_ID` and `customer_ID` are different columns on different tables —
`user3.topUser` and `user3.newCustomer`. **So as things stand the frontend
cannot create a booking at all.** It has no way to learn the value the endpoint
demands.

Either fix works:

1. Add `customer_ID` to the login response in `authController.login` (join
   `newCustomer` when `accountType` is `Customer`), or
2. Add `GET /api/customers/me`, which reads the `user_ID` out of the JWT and
   returns the matching `newCustomer` row.

Option 2 is the tidier one and is what `CustomerProvider` already expects. It
also keeps the login response the same for all three roles.

### One more thing

`createBooking` never stores which service was booked. It inserts
`customer_ID`, `date`, `time`, `location` and a hardcoded `'Pending'` — so a
booking cannot be priced or reported on. `new_jobBooking.job` already has an FK
to `payables.service`, so the link exists at the job level, but `Booking` itself
needs either a `service_id` column or a row written into `job` at the same time.

The frontend sends `service_id` in the request body already, so it will work
the moment the backend reads it.

## Loyalty scheme — proposal, not a decision

All of it lives in `src/constants/loyalty.js`, so changing the rules is one
file.

**Earning.** 1 point per S$1 spent, credited when a booking reaches
`Completed`.

Points are deliberately *not* awarded at booking time. Doing that would let
someone book and cancel repeatedly to farm points.

**Redeeming.** A fixed ladder rather than a flat rate:

| Points | Reward | Value per point |
| ------ | ------ | --------------- |
| 100    | S$5    | 0.050 |
| 250    | S$15   | 0.060 |
| 500    | S$35   | 0.070 |
| 1000   | S$80   | 0.080 |

The rate climbs, so saving up is worth more than cashing out early. That is the
part worth explaining when the scheme is presented — it is a deliberate choice,
not an accident of the numbers.

**What it costs.** At the top tier the discount is 8% of what was spent to earn
it. Whether the business can carry that is a question for the team, and the
answer is one edit to `REDEMPTION_TIERS`.

### What the database is missing

`user3.newCustomer.loyaltyPoints` holds the balance, and
`CHECK (loyaltyPoints >= 0)` stops it going negative. That is all that exists.

There is no table for redeemed vouchers, so nothing records that points were
spent or whether a voucher was used. Something like:

```sql
CREATE TABLE payables.voucher (
    voucher_ID INT IDENTITY(1,1) PRIMARY KEY,
    customer_ID INT NOT NULL,
    code VARCHAR(20) NOT NULL CONSTRAINT UQ_voucher_code UNIQUE,
    discount DECIMAL(10,2) NOT NULL,
    pointsSpent INT NOT NULL,
    redeemedOn DATE NOT NULL,
    isUsed BIT NOT NULL CONSTRAINT DF_voucher_isUsed DEFAULT 0,

    CONSTRAINT FK_voucher_customer FOREIGN KEY (customer_ID)
        REFERENCES user3.newCustomer(customer_ID)
);
```

Redeeming must subtract the points and insert the voucher **in one
transaction**. If it fails halfway the customer either loses points for nothing
or gets a free voucher. `authController.register` already does a two-step insert
this way and is worth copying.

## Connecting it for real

Same switch as the login page — in `frontend/.env`:

```
VITE_USE_MOCK_AUTH=false
VITE_API_BASE_URL=http://localhost:5000
```

Endpoints that exist start working; the rest will error until they are written.
They can be built one at a time.
