import { convertNxExecutor } from '@titan/devkit';
import vitestExecutor from './vitest.impl';

export default convertNxExecutor(vitestExecutor);
