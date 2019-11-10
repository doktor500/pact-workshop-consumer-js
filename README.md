### Pre-Requirements

- Fork this github repository into your account (You will find a "fork" icon on the top right corner)
- Clone the forked repository that exists in **your github account** into your local machine

### Requirements

- Nodejs v12.4+
- Yarn

### Consumer Step 0 (Setup)

#### NodeJs

Check your nodejs version with `node --version`

If you need to install node v12.4.0 or greater follow the instructions on [nvm](https://github.com/nvm-sh/nvm)

If you need to install yarn `npm install -g yarn`

### Install dependencies

- Navigate to the `pact-workshop-consumer-js` directory and execute `yarn`

### Run the tests

- Execute `yarn test`

Get familiarised with the code

![System diagram](resources/system-diagram.png "System diagram")

There are two microservices in this system. A `consumer` (this repository) and a `provider`.

The "provider" is a PaymentService that validates if a credit card number is valid in the context of that system.

The "consumer" only makes requests to PaymentService to verify payment methods.

Navigate to the [Provider](https://github.com/doktor500/pact-workshop-provider-js) repository and follow the 
instructions in the Providers' readme file
