import joi from "joi";

export async function cashInOutSchema(req, res, next) {
  const cash = req.body;

  const cashSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().max(30).required(),
  });

  const validation = cashSchema.validate(cash, { abortEarly: false });

  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }
  next();
}

export async function updateCashSchema(req, res, next) {
  const cash = req.body;
  const cashSchema = joi
    .object({
      value: joi.number(),
      description: joi.string().max(30),
    })
    .or("value", "description")
    .required();

  const validation = cashSchema.validate(cash, { abortEarly: false });
  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }
  next();
}

export async function singUpSchema(req, res, next) {
  const user = req.body;
  const userSchema = joi.object({
    name: joi.string().min(5).max(40).required(),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi
      .string()
      .pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}/
      )
      .required(),
    repeatPassword: joi.string().required().valid(joi.ref("password")),
  });

  const validation = userSchema.validate(user, { abortEarly: false });
  if (validation.error) {
    res.status(422).send(validation.error.details);
    console.log("validation.error.details: ", validation.error.details);
    return;
  }
  next();
}

export async function signInSchema(req, res, next) {
  const signInSchema = joi.object({
    password: joi
      .string()
      .pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}/
      )
      .required(),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
  });

  const validation = signInSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    res.status(422).send("Invalid e-mail or password");
    return;
  }
  next();
}
