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

  login: async (email, password) => {
    return await axiosInstance.post('/auth/login', {
      email: email,
      password: password,
    });
  },

  naverLogin: async (code, state) => {
    return await axiosInstance.post('/auth/naverLogin', {
      code: code,
      state: state,
    });
  },
};

export default authApi;
