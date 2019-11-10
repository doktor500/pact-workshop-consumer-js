import { PaymentMethodStatus, PaymentServiceClient } from "../../src/payments/paymentServiceClient";

describe("Payment Service", () => {
  it("validates a valid payment method", async () => {
    const http = { get: jest.fn().mockReturnValue(Promise.resolve({ status: "valid" })) };
    const validPaymentMethod = "1111 1111 1111 1111";
    const response = await new PaymentServiceClient(http).validate(validPaymentMethod);
    expect(response).toEqual(PaymentMethodStatus.Valid);
  });

  it("validates an invalid payment method", async () => {
    const http = { get: jest.fn().mockReturnValue(Promise.resolve({ status: "invalid" })) };
    const invalidPaymentMethod = "1111";
    const response = await new PaymentServiceClient(http).validate(invalidPaymentMethod);
    expect(response).toEqual(PaymentMethodStatus.Invalid);
  });
});
