/* eslint-disable */
// Ignore @titan/jest dependency since it is the installed version not the one in the workspace
// nx-ignore-next-line
import nxPreset from '@titan/jest/preset';

module.exports = {
  ...nxPreset,
  displayName: 'nx-dev',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@titan/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/nx-dev/nx-dev',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
};
