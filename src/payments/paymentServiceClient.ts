import Http from "../common/http";

const PAYMENT_SERVICE_ENDPOINT = process.env.PAYMENT_SERVICE_ENDPOINT || "http://localhost:4567";

export enum PaymentMethodStatus {
  Valid = "valid",
  Invalid = "invalid"
}

export interface PaymentService {
  validate(paymentMethod: string): Promise<PaymentMethodStatus>;
}

export class PaymentServiceClient implements PaymentService {
  private readonly http: Http;

  public constructor(http: Http = new Http()) {
    this.http = http;
  }

  public async validate(paymentMethod: string): Promise<PaymentMethodStatus> {
    return this.http.get(`${PAYMENT_SERVICE_ENDPOINT}/validate-payment-method/${paymentMethod}`)
      .then(responseBody => responseBody.status as PaymentMethodStatus);
  }
}
