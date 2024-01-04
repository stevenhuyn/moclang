type Variable = { type: "Variable"; name: string };
type Abstraction = { type: "Abstraction"; param: Variable; body: LambdaTerm };
type Application = { type: "Application"; left: LambdaTerm; right: LambdaTerm };
type LambdaTerm = Variable | Abstraction | Application;
