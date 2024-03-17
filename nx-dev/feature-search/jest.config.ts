/* eslint-disable */
export default {
  displayName: 'nx-dev-feature-search',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@titan/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/nx-dev/feature-search',
  preset: '../../jest.preset.js',
};
