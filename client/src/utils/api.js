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
