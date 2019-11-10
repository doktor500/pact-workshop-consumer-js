### Consumer Step 3 (Working with a PACT broker)

#### Publish contracts to the pact-broker

In the `pact-workshop-consumer-js` directory execute `yarn add -D @pact-foundation/pact-node`.

Modify the `test/payments/paymentServicePact.ts` to allow publishing pacts to the broker, the file should contain the 
following content:

```typescript
import * as path from "path";
import { execSync } from "child_process";
import { Pact } from "@pact-foundation/pact";

const HOST = "localhost";
const SERVER_PORT = 4567;
const BROKER_PORT = 8000;

const PACTS_DIR = path.resolve(process.cwd(), "pacts");

const paymentServicePact = () => new Pact({
  host: HOST,
  port: SERVER_PORT,
  log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
  dir: PACTS_DIR,
  pactfileWriteMode: "update",
  consumer: "PaymentServiceClient",
  provider: "PaymentService",
  logLevel: "info"
});

const gitCommit = execSync("git rev-parse HEAD").toString().trim();
const gitBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

export const pactBrokerConfig = {
  pactBroker: process.env.PACT_BROKER_BASE_URL || `http://${HOST}:${BROKER_PORT}`,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  pactFilesOrDirs: [PACTS_DIR],
  consumerVersion: gitCommit,
  tags: [gitBranch]
};

export default paymentServicePact;
```

Also, modify the `test/payments/paymentServiceClient.spec.ts` file so it looks like:

```typescript
import pactNode from "@pact-foundation/pact-node";

import Http from "../../src/common/http";
import { PaymentServiceClient } from "../../src/payments/paymentServiceClient";

// @ts-ignore
import { default as paymentServicePact, pactBrokerConfig } from "./paymentServicePact";

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

        afterEach(async () => {
            await pactNode.publishPacts(pactBrokerConfig);
            await pact.finalize();
        });

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

        afterEach(async () => {
            await pactNode.publishPacts(pactBrokerConfig);
            await pact.finalize();
        });

        it("when the payment method is fraudulent", async () => {
            const response = await new PaymentServiceClient(new Http()).validate(fraudulentPaymentMethod);
            expect(response).toEqual(status);
        });
    });
});
```

Note how we added a call in the `afterEach` blocks to publish the contracts to the broker.

If you have a broker running on [localhost](http://localhost:8000), run `yarn test` again to publish the contracts to
the broker otherwise run `PACT_BROKER_BASE_URL=$PACT_BROKER_BASE_URL yarn test` if you want to publish the contract to
a different broker.

Navigate to the broker URL to see the contract published.

Navigate to the directory in where you checked out `pact-workshop-provider-js`, run
`git clean -df && git checkout . && git checkout provider-step3` and follow the instructions in the **Provider's**
readme file.
