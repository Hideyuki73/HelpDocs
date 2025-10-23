import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  //TEMPORARIO
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Aplica-se a todos os arquivos de código
    rules: {
      // Desabilita a regra que proíbe o uso explícito de 'any'
      '@typescript-eslint/no-explicit-any': 'off',

      // Desabilita a regra que proíbe variáveis não utilizadas
      '@typescript-eslint/no-unused-vars': 'off',

      // Opcional: Se você estiver usando o React e tiver problemas com 'prop-types'
      'react/prop-types': 'off',
    },
  },
]

export default eslintConfig
