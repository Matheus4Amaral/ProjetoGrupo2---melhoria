import api from './api'

export const productService = {
  
  async getAll() {
    const response = await api.get('/products')
    return response.data 
  },

  async getById(id) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async searchByName(nome) {
    const response = await api.get(`/products/search/nome?nome=${encodeURIComponent(nome)}`)
    return response.data
  },

  async create(productData) {
    const response = await api.post('/products', productData)
    return response.data
  },

  async update(id, productData) {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }
}
