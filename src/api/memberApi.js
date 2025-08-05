import axiosInstance from './axiosInstance';

const memberApi = {
  getMyInfo: async () => {
    return await axiosInstance.get('/member/me');
  },

  getMyCard: async () => {
    return await axiosInstance.get('/card/my');
  },
};

export default memberApi;
