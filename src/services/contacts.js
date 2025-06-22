import { Contact } from '../models/contactModel.js';

export async function getAllContacts() {
  return Contact.find();
}

export async function getContactById(contactId) {
  return Contact.findById(contactId);
}
