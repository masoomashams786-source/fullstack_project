import api from "./axios";

export const changePassword = async (url, { arg }) => {
  const res = await api.post(url, {
    old_password: arg.oldPassword,
    new_password: arg.newPassword,
  });

  return res.data;
};
