const axios = require('axios');

const createAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/register', {
      name: 'Admin',
      email: 'admin@besustainable.com',
      password: '1234'
    });
    console.log('Admin criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar admin:', error.response?.data || error.message);
  }
};

createAdmin(); 