export const parseSortProperty = (property: string) => {
  return property.replaceAll(" ", "_");
};
