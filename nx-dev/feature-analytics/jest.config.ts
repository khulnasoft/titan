/* eslint-disable */
export default {
  displayName: 'nx-dev-feature-analytics',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@titan/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/nx-dev/feature-analytics',
  preset: '../../jest.preset.js',
};
