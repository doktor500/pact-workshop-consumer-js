import { PaymentMethodStatus, PaymentService } from "./paymentServiceClient";

export default class PaymentMethodValidator {
  private paymentServiceClient: PaymentService;

  public constructor(paymentServiceClient: PaymentService) {
    this.paymentServiceClient = paymentServiceClient;
  }

  public async validate(paymentMethod: string): Promise<boolean> {
    return this.paymentServiceClient.validate(paymentMethod)
      .then(paymentMethodStatus => paymentMethodStatus === PaymentMethodStatus.Valid);
  }
}
