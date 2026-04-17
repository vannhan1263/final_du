import axios from 'axios';

export const sendGiftApi = async (payload) => {
  const res = await axios.post('/api/gift', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const getGiftsApi = async () => {
  const res = await axios.get('/api/gifts');
  return res.data;
};

export const deleteGiftApi = async (id) => {
  const res = await axios.delete(`/api/gifts/${id}`);
  return res.data;
};

export const createLetterApi = async (payload) => {
  const res = await axios.post('/api/letters', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const getLettersApi = async () => {
  const res = await axios.get('/api/letters');
  return res.data;
};

export const getLetterByIdApi = async (id) => {
  const res = await axios.get(`/api/letters/${id}`);
  return res.data;
};

export const deleteLetterApi = async (id) => {
  const res = await axios.delete(`/api/letters/${id}`);
  return res.data;
};
