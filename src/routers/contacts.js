import express from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactByIdController,
  deleteContactByIdController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', ctrlWrapper(getContactByIdController));
router.post('/', ctrlWrapper(createContactController));
router.patch('/:contactId', ctrlWrapper(updateContactByIdController));
router.delete('/:contactId', ctrlWrapper(deleteContactByIdController));

export default router;
