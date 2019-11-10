import * as React from "react";
import "./bootstrap.min.css";

import Http from "./common/http";
import PaymentMethodValidator from "./payments/paymentMethodValidator";
import { PaymentServiceClient } from "./payments/paymentServiceClient";

interface Props {}
interface State { error: string | undefined, isValid: boolean | undefined, paymentMethod: string }

const http = new Http();
const paymentServiceClient = new PaymentServiceClient(http);
const paymentMethodValidator = new PaymentMethodValidator(paymentServiceClient);

export default class App extends React.Component<Props, State> {
  public state: State = { error: undefined, isValid: undefined, paymentMethod: "" };

  public validate = async (event: any) => {
    event.preventDefault();
    try {
      const isValid = await paymentMethodValidator.validate(this.state.paymentMethod);
      this.setState({ isValid, paymentMethod: this.state.paymentMethod });
    } catch (error) {
      this.setState({ error: "Unexpected error", paymentMethod: this.state.paymentMethod });
    }
  };

  public updatePaymentMethod = (event: any) => {
    this.setState({ isValid: undefined, paymentMethod: event.target.value });
  };

  public renderValidationResult = () => {
    if (this.state.isValid !== undefined) {
      return (
        <div className={`text-center mt-3 alert alert-${this.state.isValid ? "success" : "danger"}`}>
          <span>{this.state.paymentMethod} is {this.state.isValid ? "valid" : "invalid"}</span>
        </div>
      );
    } else if (this.state.error) {
      return(
          <div className="text-center mt-3 alert alert-danger">
            <span>{this.state.error}</span>
          </div>
      )
    }
    return "";
  };

  public render() {
    return (
      <div className="container w-25 mt-3">
        <div className="form-group">
          <label>Validate payment method</label>
          <input type="text" className="form-control"
            value={this.state.paymentMethod} onChange={this.updatePaymentMethod} />
          <button className="btn btn-secondary mt-3" onClick={this.validate}>Validate</button>
        </div>
        {this.renderValidationResult()}
      </div>
    );
  }
}
