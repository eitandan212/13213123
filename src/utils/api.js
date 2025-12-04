import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // Auth
  register: (data) => axios.post(`${API}/auth/register`, data),
  login: (data) => axios.post(`${API}/auth/login`, data),
  
  // Products
  getProducts: (category) => {
    const url = category ? `${API}/products?category=${category}` : `${API}/products`;
    return axios.get(url);
  },
  getProduct: (id) => axios.get(`${API}/products/${id}`),
  createProduct: (data, userEmail) => axios.post(`${API}/products`, data, {
    headers: { 'user-email': userEmail }
  }),
  updateProduct: (id, data, userEmail) => axios.put(`${API}/products/${id}`, data, {
    headers: { 'user-email': userEmail }
  }),
  deleteProduct: (id, userEmail) => axios.delete(`${API}/products/${id}`, {
    headers: { 'user-email': userEmail }
  }),
  
  // Checkout
  createCheckoutSession: (data, userEmail) => axios.post(`${API}/checkout/session`, data, {
    headers: { 'user-email': userEmail }
  }),
  getCheckoutStatus: (sessionId) => axios.get(`${API}/checkout/status/${sessionId}`),
  
  // Orders
  getUserOrders: (userEmail) => axios.get(`${API}/orders`, {
    headers: { 'user-email': userEmail }
  }),
  getAllOrders: (userEmail) => axios.get(`${API}/orders/all`, {
    headers: { 'user-email': userEmail }
  }),
  
  // Tickets
  createTicket: (data, userEmail) => axios.post(`${API}/tickets`, data, {
    headers: { 'user-email': userEmail }
  }),
  getUserTickets: (userEmail) => axios.get(`${API}/tickets`, {
    headers: { 'user-email': userEmail }
  }),
  getAllTickets: (userEmail) => axios.get(`${API}/tickets/all`, {
    headers: { 'user-email': userEmail }
  }),
  getTicket: (id, userEmail) => axios.get(`${API}/tickets/${id}`, {
    headers: { 'user-email': userEmail }
  }),
  replyToTicket: (id, data, userEmail) => axios.post(`${API}/tickets/${id}/reply`, data, {
    headers: { 'user-email': userEmail }
  }),
  updateTicketStatus: (id, status, userEmail) => axios.patch(`${API}/tickets/${id}/status?status=${status}`, {}, {
    headers: { 'user-email': userEmail }
  }),
};

export default api;