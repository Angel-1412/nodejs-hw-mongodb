import { Contact } from '../models/contactModel.js';

export async function getAllContacts(
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortDirection = 1,
  type,
  isFavourite,
) {
  const skip = (page - 1) * perPage;
  const sortOptions = { [sortBy]: sortDirection };
  const filter = { userId };

  if (type) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter).sort(sortOptions).skip(skip).limit(perPage).lean(),
    Contact.countDocuments(filter),
  ]);

  return { contacts, totalItems };
}

export async function getContactById(contactId, userId) {
  return Contact.findOne({ _id: contactId, userId });
}

export async function createContact(contactData) {
  return Contact.create(contactData);
}

export async function updateContactById(contactId, userId, updateData) {
  return Contact.findOneAndUpdate({ _id: contactId, userId }, updateData, {
    new: true,
  });
}

export async function deleteContactById(contactId, userId) {
  return Contact.findOneAndDelete({ _id: contactId, userId });
}
