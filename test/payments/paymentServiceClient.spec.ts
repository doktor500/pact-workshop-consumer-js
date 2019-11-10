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
