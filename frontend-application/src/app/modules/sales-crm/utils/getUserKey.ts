import { UserKey } from "../types/key";

export const getUserKey = (user: UserKey) => {
  const { email, id, index } = user || {};
  return `${email}-${id}-${index}`;
};
