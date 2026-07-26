import api from './api'

export const saleService = {
  
  async getAll() {
    const response = await api.get('/sales')
    return response.data 
  },

  async getById(id) {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },

  async create(saleData) {
    const response = await api.post('/sales', saleData)
    return response.data
  },

  async update(id, saleData) {
    const response = await api.put(`/sales/${id}`, saleData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/sales/${id}`)
    return response.data
  }
}
