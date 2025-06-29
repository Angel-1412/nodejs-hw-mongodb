import { Contact } from '../models/contactModel.js';

export async function getAllContacts() {
  return Contact.find();
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
