const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  const [month, day, year] = dateStr.split('/');
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
};

export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const [month, day, year] = dateStr.split('/');
  return new Date(year, parseInt(month) - 1, parseInt(day));
};

export const compareDates = (date1, date2) => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return 0;
  return d1.getTime() - d2.getTime();
};

export const isDateBetween = (date, start, end) => {
  const d = parseDate(date);
  const s = parseDate(start);
  const e = parseDate(end);
  
  if (!d || !s || !e) return false;
  return d >= s && d <= e;
}; 