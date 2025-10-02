import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// // Interceptor para respostas com erro
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       const status = error.response.status

//       switch (status) {
//         case 400:
//           console.log('⚠️ Erro 400: Requisição inválida', error.response.data)
//           break
//         case 401:
//           console.log('🔒 Erro 401: Não autorizado', error.response.data)
//           break
//         case 403:
//           console.log('🚫 Erro 403: Proibido', error.response.data)
//           break
//         case 404:
//           console.log('❌ Erro 404: Recurso não encontrado', error.response.data)
//           break
//         case 500:
//           console.log('💥 Erro 500: Erro interno do servidor', error.response.data)
//           break
//         default:
//           console.log(`❗ Erro ${status}:`, error.response.data)
//       }

//       // devolve um objeto padronizado em vez de lançar exceção
//       return {
//         success: false,
//         status,
//         data: error.response.data,
//       }
//     } else if (error.request) {
//       console.log('📡 Nenhuma resposta recebida do servidor', error.request)
//       return {
//         success: false,
//         status: 0,
//         data: null,
//       }
//     } else {
//       console.log('⚡ Erro ao configurar a requisição', error.message)
//       return {
//         success: false,
//         status: -1,
//         data: null,
//       }
//     }
//   },
// )
