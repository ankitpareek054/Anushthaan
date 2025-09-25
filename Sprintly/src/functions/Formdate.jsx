// export const Formdate = (inputDate) => {
//     if (!inputDate) return '';
//     const date = new Date(inputDate);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

export const Formdate = (inputDate) => {
  if (!inputDate) return '';

  // Split the input value into day, month, year
  const dateParts = inputDate.split('-');
  
  // Ensure that the year is a 4-digit value
  let year = dateParts[0];
  if (year.length > 4) {
    // Restrict year to 4 digits
    year = year.substring(0, 4);
  }

  // Ensure the day and month are valid
  const day = String(dateParts[2]).padStart(2, '0');
  const month = String(dateParts[1]).padStart(2, '0');

  // Return the formatted date in dd/mm/yyyy format
  return `${day}/${month}/${year}`;
};
