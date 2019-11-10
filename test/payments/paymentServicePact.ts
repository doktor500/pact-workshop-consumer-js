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
