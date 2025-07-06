import createHttpError from 'http-errors';

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(createHttpError.BadRequest(error.message));
    }
    next();
  };
};

export default validateBody;
