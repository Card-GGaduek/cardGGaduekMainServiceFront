import axiosInstance from './axiosInstance';

const memberApi = {
  getMyInfo: async () => {
    return await axiosInstance.get('/member/me');
  },
};

export default memberApi;
