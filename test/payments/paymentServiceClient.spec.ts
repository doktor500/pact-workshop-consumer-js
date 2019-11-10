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
