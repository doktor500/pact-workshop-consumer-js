### Consumer Step 2 (Using provider state)

In our PaymentService API we want now to keep track of payment methods that are suspected to be fraudulent, by adding
them to a list of blacklisted payment methods.

In our consumer tests, we want to verify that when we call our PaymentService with an invalid payment method, the
response returned by the API tells us that the payment is invalid.

In order to try this scenario out, we would need somehow to have a predefined state in our PaymentService with
invalid pre-registered payment methods.

If we define the test from the point of view of the consumer for this scenario, we have different options:

1) Write an integration test in the consumer for the integration against the backend API (The Provider)
2) Write an E2E test, for example, a browser test that tests both the consumer and the provider as a whole
3) Write a contract test between the two systems

Option 1 is a reasonable approach, but you will need an instance of the provider running for testing purposes.
Option 2 is much more expensive to implement, you will need an instance of the backend API running, an instance of the
React App, and to write a browser test that although for this scenario it shouldn't be too complex, it will be more
expensive to develop and maintain.

In this workshop, we will explore a better approach. We will explore option 3, and we will implement a contract test
between the two systems.

Replace the content of `test/payments/paymentServiceClient.spec.ts` test with the following code:

```typescript
import Http from "../../src/common/http";
import { PaymentServiceClient } from "../../src/payments/paymentServiceClient";

// @ts-ignore
import paymentServicePact from "./paymentServicePact";

describe("Payment Service", () => {
    const pact = paymentServicePact();

    describe("validates a payment method", () => {
        const validPaymentMethod = "1111111111111111";
        const status = "valid";

        beforeEach(() =>
            pact
            .setup()
            .then(() => pact.addInteraction({
                    state: "",
                    uponReceiving: "a request for validating a payment method",
                    withRequest: {
                        method: "GET",
                        path: `/validate-payment-method/${validPaymentMethod}`,
                        headers: { Accept: "application/json" },
                    },
                    willRespondWith: {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: { status },
                    }
                })
            )
        );

        afterEach(async () => await pact.finalize());

        it("when the payment method is valid", async () => {
            const response = await new PaymentServiceClient(new Http()).validate(validPaymentMethod);
            expect(response).toEqual(status);
        });
    });

    describe("does not validate a payment method", () => {
        const fraudulentPaymentMethod = "9999999999999999";
        const status = "fraud";

        beforeEach(() =>
            pact
            .setup()
            .then(() => pact.addInteraction({
                    state: "fraudulent payment method",
                    uponReceiving: "a request for validating a payment method",
                    withRequest: {
                        method: "GET",
                        path: `/validate-payment-method/${fraudulentPaymentMethod}`,
                        headers: { Accept: "application/json" },
                    },
                    willRespondWith: {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: { status },
                    }
                })
            )
        );

        afterEach(async () => await pact.finalize());

        it("when the payment method is fraudulent", async () => {
            const response = await new PaymentServiceClient(new Http()).validate(fraudulentPaymentMethod);
            expect(response).toEqual(status);
        });
    });
});
```

Take a look at the second test, note that the `state` property contains now a value for the scenario that depends on
some state.

Run `yarn test` in the `pact-workshop-consumer-js` directory in order to update the consumer pacts and see the new pact
in the `pacts/paymentserviceclient-paymentservice.json` file.

Navigate to the directory in where you checked out `pact-workshop-provider-js`,
run `git clean -df && git checkout . && git checkout provider-step2` and follow the instructions in the Providers' 
readme file.
