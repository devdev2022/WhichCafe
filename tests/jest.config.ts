// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  testMatch: [
    "**/tests/performance/**/*.test.ts", // .test.ts 확장자를 가진 파일을 테스트 파일로 인식
    "**/tests/performance/**/*.spec.ts", // .spec.ts 확장자를 가진 파일을 테스트 파일로 인식
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

export default config;
