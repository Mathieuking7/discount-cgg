export const getVehicleAge = (dateMiseEnCirculation: string): number => {
  // Format attendu : "YYYY-MM-DD" ou "DD-MM-YYYY" ou "DD/MM/YYYY"
  let date: Date;
  
  if (dateMiseEnCirculation.includes('-')) {
    const parts = dateMiseEnCirculation.split('-');
    if (parts[0].length === 4) {
      // Format YYYY-MM-DD
      date = new Date(dateMiseEnCirculation);
    } else {
      // Format DD-MM-YYYY
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  } else if (dateMiseEnCirculation.includes('/')) {
    // Format DD/MM/YYYY
    const parts = dateMiseEnCirculation.split('/');
    date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  } else {
    throw new Error('Format de date invalide');
  }

  const now = new Date();
  const ageInYears = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    return ageInYears - 1;
  }
  
  return ageInYears;
};
