import { Contact } from '../models/contactModel.js';

export async function getAllContacts(
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortDirection = 1,
  type,
  isFavourite,
) {
  const skip = (page - 1) * perPage;
  const sortOptions = { [sortBy]: sortDirection };
  const filter = {};

  if (type) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter).sort(sortOptions).skip(skip).limit(perPage).lean(), // ← додано .lean()
    Contact.countDocuments(filter),
  ]);

  return { contacts, totalItems };
}

export async function getContactById(contactId) {
  return Contact.findById(contactId);
}

export async function createContact(contactData) {
  return Contact.create(contactData);
}

export async function updateContactById(contactId, updateData) {
  return Contact.findByIdAndUpdate(contactId, updateData, { new: true });
}

export async function deleteContactById(contactId) {
  return Contact.findByIdAndDelete(contactId);
}
