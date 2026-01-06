export const parseKey = (key: string) => {
  return key
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join("");
};

export const parsePlainValue = (type: string, value: any) => {
  switch (type) {
    case "rich_text":
    case "title":
      const textKey = type === "rich_text" ? "rich_text" : "title";
      const textData = value?.[textKey]?.[0];
      return textData?.plain_text || textData?.text?.content || "";
    case "number":
      return `${
        value?.number?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || "0.00"
      }`;
    case "people":
      return value?.people?.[0]?.name || "";
    case "select":
      return value?.select?.name || "";
    case "status":
      return value?.status?.name || "";
    case "checkbox":
      return value?.checkbox || value?.plainValue?.checkbox || false;
    case "multi_select":
      return value?.multi_select || value?.plainValue?.multi_select || [];
    case "date":
      return value?.date;
    case "created_time":
    case "last_edited_time":
      const timeKey = type === "created_time" ? "created_time" : "last_edited_time";
      return value?.[timeKey] || value?.plainValue?.[timeKey];
    default:
      return value;
  }
};
