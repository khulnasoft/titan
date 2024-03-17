import { convertNxExecutor } from '@titan/devkit';
import vitePreviewServerExecutor from './preview-server.impl';

export default convertNxExecutor(vitePreviewServerExecutor);
