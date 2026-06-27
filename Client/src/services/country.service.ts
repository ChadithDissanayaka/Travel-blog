import api from './api';

export const countryService = {
  async getAll() {
    const response = await api.get('/countries');
    return response.data;
  }
};
