Run `yarn start` in this repo to start the frontend application

Navigate to `pact-workshop-provider-js` and run `yarn start` to execute the payment service backend API (provider)

Navigate to `localhost:3000` and try to validate a valid payment method. Remember that a valid payment method contains
a number of length 16, so, for instance, you can use `1234 1234 1234 1234`. Type the credit card number in the form
and click on validate. Surprisingly, you will get a response from the payment service backend API (the provider)
stating that your payment method is invalid, can you spot what the problem is...?

The consumer was expecting a response with this JSON payload `{ "status": "valid" }`, however, the server replied with
this payload `{ "state": "valid" }`. The "contract" between the React App (The consumer) and the backend API
(The provider) is broken.

Now think for a moment about this testing strategy, both the consumer and the provider are covered by unit tests, but
things are not working well between them as a whole. We are missing some tests that can give us confidence that
everything works in the way that we expect, we have different options at this stage, the most common are:

1) Write an integration test in the consumer for the integration against the backend API (The Provider)
2) Write an E2E test, for example, a browser test that tests both the consumer and the provider as a whole
3) Write a contract test between the two systems

Option 1 is a reasonable approach, but you will need an instance of the provider running for testing purposes.
Option 2 is much more expensive to implement, you will need an instance of the backend API running, an instance of the
React App, and to write a browser test that although for this scenario it shouldn't be too complex, it will be more
expensive to develop and maintain.

In this workshop, we will explore a better approach. We will explore option 3, and we will implement a contract test
between the two systems.

Run `yarn add -D @pact-foundation/pact` to install Pact as a dev dependency.

Create a `test/payments/paymentServicePact.ts` file with the following code:

```typescript
import * as path from "path";
import { Pact } from "@pact-foundation/pact";

const HOST = "localhost";
const PORT = 4567;

const paymentServicePact = () => new Pact({
    host: HOST,
    port: PORT,
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    pactfileWriteMode: "update",
    consumer: "PaymentServiceClient",
    provider: "PaymentService",
    logLevel: "info"
});

export default paymentServicePact;
```

This file configures Pact between the provider `PaymentService` and the consumer `PaymentServiceClient` (this repo),
and sets some basic configuration such as the host and the port in where the provider's API runs.

Now let's modify the existing unit test file `test/payments/paymentServiceClient.spec.ts` to convert it to a contract 
test.

Replace the content of the test with the following code:

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
});
```

Stop the server running on `pact-workshop-provider-js`, in `pact-workshop-consumer-js` directory run `yarn test` and see
what happens. The output of the test is different and a new JSON file is created in the `pacts` directory. Take a look 
at the content of the JSON file, this is the contract that Pact has created.

The content of the file should be similar to:

```json
{
  "consumer": {
    "name": "PaymentServiceClient"
  },
  "provider": {
    "name": "PaymentService"
  },
  "interactions": [
    {
      "description": "a request for validating a payment method",
      "request": {
        "method": "GET",
        "path": "/validate-payment-method/1111111111111111",
        "headers": {
          "Accept": "application/json"
        }
      },
      "response": {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "status": "valid"
        }
      },
      "metadata": null
    }
  ],
  "metadata": {
    "pactSpecification": {
      "version": "2.0.0"
    }
  }
}
```

Navigate to the directory in where you checked out `pact-workshop-provider-js`, run
`git clean -df && git checkout . && git checkout provider-step1` and follow the instructions in the Providers' readme
file.
