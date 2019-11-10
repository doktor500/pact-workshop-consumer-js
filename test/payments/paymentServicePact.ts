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
