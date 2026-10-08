export type OrderAddressSnapshot = {
  fullName: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  district?: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  notes?: string;
};
