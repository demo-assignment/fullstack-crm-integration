export const parseDate = (date: string) => {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
  }).format(dateObj);
};
