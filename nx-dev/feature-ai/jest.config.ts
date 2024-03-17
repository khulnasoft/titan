/* eslint-disable */
export default {
  displayName: 'nx-dev-feature-search',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@titan/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/nx-dev/feature-ai',
  preset: '../../jest.preset.js',
};
