import { ModuleWithProviders, NgModule } from '@angular/core';
import { DataPersistence } from './data-persistence';

/**
 * @whatItDoes Provides services for enterprise Angular applications.
 *
 * See {@link DataPersistence} for more information.
 */
@NgModule({})
export class TitanModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: TitanModule, providers: [DataPersistence] };
  }
}
