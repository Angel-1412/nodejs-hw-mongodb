import createHttpError from 'http-errors';

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(
        createHttpError.BadRequest(
          error.details.map((detail) => detail.message).join(', '),
        ),
      );
    }
    next();
  };
};

export default validateBody;
