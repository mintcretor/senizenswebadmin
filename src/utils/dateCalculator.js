export const calculateMonthsAndDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { months: 0, days: 0 };
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { months: 0, days: 0 };
    }

    let months = 0;
    let days = 0;
    let current = new Date(start);

    while (true) {
      let nextMonth = current.getMonth() + 1;
      let nextYear = current.getFullYear();
      
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      
      const nextDate = new Date(nextYear, nextMonth, current.getDate());
      
      if (nextDate <= end) {
        months++;
        current = nextDate;
      } else {
        break;
      }
    }

    days = Math.floor((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    return { months, days };
  } catch (error) {
    console.error('Error calculating date difference:', error);
    return { months: 0, days: 0 };
  }
};