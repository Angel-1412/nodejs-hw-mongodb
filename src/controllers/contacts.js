import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const pageNum = parseInt(page);
  const perPageNum = parseInt(perPage);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  if (isNaN(pageNum) || isNaN(perPageNum) || pageNum < 1 || perPageNum < 1) {
    throw createError(
      400,
      'Query parameters "page" and "perPage" must be positive numbers',
    );
  }

  const { contacts, totalItems } = await getAllContacts(
    pageNum,
    perPageNum,
    sortBy,
    sortDirection,
    type,
    isFavourite,
  );

  const totalPages = Math.ceil(totalItems / perPageNum);

  const normalizedContacts = contacts.map(({ _id, ...rest }) => ({
    id: _id,
    ...rest,
  }));

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      contacts: normalizedContacts,
      page: pageNum,
      perPage: perPageNum,
      totalItems,
      totalPages,
      hasPreviousPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    },
  });
};

export async function getContactByIdController(req, res, next) {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

export async function createContactController(req, res) {
  const { name, phoneNumber, contactType } = req.body;

  if (!name || !phoneNumber || !contactType) {
    throw createError(
      400,
      'Missing required fields: name, phoneNumber, contactType',
    );
  }

  const newContact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
}

export async function updateContactByIdController(req, res) {
  const { contactId } = req.params;
  const updateData = req.body;

  const updatedContact = await updateContactById(contactId, updateData);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
}

export async function deleteContactByIdController(req, res) {
  const { contactId } = req.params;

  const deletedContact = await deleteContactById(contactId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
}
