export const LANDBANK_DETAILS = {
  accountName: 'LGU CATARMAN',
  accountNumber: '0992100982',
  bankName: 'LANDBANK',
  email: 'dininggasanriversideinn@gmail.com',
  phone: '9458019323',
};

export function getPaymentInstructions() {
  return `Bank Transfer via LANDBANK
Account Name: ${LANDBANK_DETAILS.accountName}
Account Number: ${LANDBANK_DETAILS.accountNumber}
Email: ${LANDBANK_DETAILS.email}
Contact: ${LANDBANK_DETAILS.phone}`;
}
