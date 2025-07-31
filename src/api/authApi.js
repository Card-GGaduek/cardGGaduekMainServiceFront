import axiosInstance from './axiosInstance';

const authApi = {
  join: async (joinForm) => {
    return await axiosInstance.post('/auth/join', {
      email: joinForm.email,
      password: joinForm.password,
      name: joinForm.name,
      phone: joinForm.phone,
    });
  },

  sendCode: async (email) => {
    return await axiosInstance.get('/auth/join/emailConfirm', {
      params: { email: email },
    });
  },

  verifyCode: async (email, code) => {
    return await axiosInstance.post('/auth/join/verifyCode', {
      email: email,
      code: code,
    });
  },
};

export default authApi;
