import axios from 'axios';

export const getCardList = (memberId) =>
    axios.get(`/api/main/card/list?memberId=${memberId}`);

export const getCardBack = (cardId) =>
    axios.get(`/api/main/card/${cardId}/back`);