import PaymentMethodValidator from "../../src/payments/paymentMethodValidator";
import { PaymentMethodStatus, PaymentService } from "../../src/payments/paymentServiceClient";

describe("Payment method validator", () => {
    it("returns if a payment method is valid", async () => {
        const paymentMethodResponse = jest.fn().mockReturnValue(Promise.resolve(PaymentMethodStatus.Valid));
        const paymentServiceClient: PaymentService = { validate: paymentMethodResponse };
        const paymentMethodValidator = new PaymentMethodValidator(paymentServiceClient);

        expect(await paymentMethodValidator.validate("1111 1111 1111 1111")).toBe(true);
    });

    it("returns if a payment method is invalid", async () => {
        const paymentMethodResponse = jest.fn().mockReturnValue(Promise.resolve(PaymentMethodStatus.Invalid));
        const paymentServiceClient: PaymentService = { validate: paymentMethodResponse };
        const paymentMethodValidator = new PaymentMethodValidator(paymentServiceClient);

        expect(await paymentMethodValidator.validate("1111")).toBe(false);
    });
});
