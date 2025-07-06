import mongoose from 'mongoose';
import createHttpError from 'http-errors';

const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createHttpError.BadRequest(`${contactId} is not a valid id`));
  }
  next();
};

export default isValidId;
