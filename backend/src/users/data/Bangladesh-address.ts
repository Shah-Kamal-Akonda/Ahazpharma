export const bangladeshAddresses = {
  Dhaka: {
    districts: {
      Dhaka: ['Dhaka City', 'Savar', 'Keraniganj', 'Dhamrai'],
      Gazipur: ['Gazipur City', 'Tongi', 'Kaliganj'],
      Narayanganj: ['Narayanganj City', 'Rupganj', 'Araihazar'],
    },
  },
  Rajshahi: {
    districts: {
      Rajshahi: ['Rajshahi City', 'Paba', 'Boalia'],
      Bogra: ['Bogra City', 'Shibganj', 'Adamdighi'],
    },
  },
  Rangpur: {
    districts: {
      Rangpur: ['Rangpur City', 'Mithapukur', 'Pirganj'],
      Dinajpur: ['Dinajpur City', 'Birampur', 'Fulbari'],
    },
  },
  Chittagong: {
    districts: {
      Chittagong: ['Chittagong City', 'Sitakunda', 'Hathazari'],
      CoxsBazar: ['Coxs Bazar City', 'Chakaria', 'Ukhia'],
    },
  },
  Khulna: {
    districts: {
      Khulna: ['Khulna City', 'Dighalia', 'Koyra'],
      Jessore: ['Jessore City', 'Manirampur', 'Abhaynagar'],
    },
  },
  Barisal: {
    districts: {
      Barisal: ['Barisal City', 'Bakerganj', 'Babuganj'],
      Patuakhali: ['Patuakhali City', 'Kalapara', 'Galachipa'],
    },
  },
  Sylhet: {
    districts: {
      Sylhet: ['Sylhet City', 'Beanibazar', 'Golapganj'],
      Moulvibazar: ['Moulvibazar City', 'Kulaura', 'Sreemangal'],
    },
  },
  Mymensingh: {
    districts: {
      Mymensingh: ['Mymensingh City', 'Trishal', 'Gaffargaon'],
      Netrokona: ['Netrokona City', 'Barhatta', 'Durgapur'],
    },
  },
};

export const divisions = Object.keys(bangladeshAddresses);

export function getDistricts(division: string): string[] {
  return Object.keys(bangladeshAddresses[division]?.districts || {});
}

export function getCities(division: string, district: string): string[] {
  return bangladeshAddresses[division]?.districts[district] || [];
}