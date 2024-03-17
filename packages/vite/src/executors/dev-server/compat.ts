import { convertNxExecutor } from '@titan/devkit';
import viteDevServerExecutor from './dev-server.impl';

export default convertNxExecutor(viteDevServerExecutor);
