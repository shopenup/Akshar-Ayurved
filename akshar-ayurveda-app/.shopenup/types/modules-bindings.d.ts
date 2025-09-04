import type { IStockLocationService } from '@shopenup/framework/types'
import type { IInventoryService } from '@shopenup/framework/types'
import type { IProductModuleService } from '@shopenup/framework/types'
import type { IPricingModuleService } from '@shopenup/framework/types'
import type { IPromotionModuleService } from '@shopenup/framework/types'
import type { ICustomerModuleService } from '@shopenup/framework/types'
import type { ISalesChannelModuleService } from '@shopenup/framework/types'
import type { ICartModuleService } from '@shopenup/framework/types'
import type { IRegionModuleService } from '@shopenup/framework/types'
import type { IApiKeyModuleService } from '@shopenup/framework/types'
import type { IStoreModuleService } from '@shopenup/framework/types'
import type { ITaxModuleService } from '@shopenup/framework/types'
import type { ICurrencyModuleService } from '@shopenup/framework/types'
import type { IPaymentModuleService } from '@shopenup/framework/types'
import type { IOrderModuleService } from '@shopenup/framework/types'
import type { IAuthModuleService } from '@shopenup/framework/types'
import type { IUserModuleService } from '@shopenup/framework/types'
import type { IFulfillmentModuleService } from '@shopenup/framework/types'
import type { INotificationModuleService } from '@shopenup/framework/types'
import type { ICacheService } from '@shopenup/framework/types'
import type { IEventBusModuleService } from '@shopenup/framework/types'
import type { IWorkflowEngineService } from '@shopenup/framework/types'
import type { ILockingModule } from '@shopenup/framework/types'
import type { IFileModuleService } from '@shopenup/framework/types'

declare module '@shopenup/framework/types' {
  interface ModuleImplementations {
    'stock_location': IStockLocationService,
    'inventory': IInventoryService,
    'product': IProductModuleService,
    'pricing': IPricingModuleService,
    'promotion': IPromotionModuleService,
    'customer': ICustomerModuleService,
    'sales_channel': ISalesChannelModuleService,
    'cart': ICartModuleService,
    'region': IRegionModuleService,
    'api_key': IApiKeyModuleService,
    'store': IStoreModuleService,
    'tax': ITaxModuleService,
    'currency': ICurrencyModuleService,
    'payment': IPaymentModuleService,
    'order': IOrderModuleService,
    'auth': IAuthModuleService,
    'user': IUserModuleService,
    'fulfillment': IFulfillmentModuleService,
    'notification': INotificationModuleService,
    'cache': ICacheService,
    'event_bus': IEventBusModuleService,
    'workflows': IWorkflowEngineService,
    'locking': ILockingModule,
    'file': IFileModuleService
  }
}