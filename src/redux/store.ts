import { configureStore } from '@reduxjs/toolkit';
import contractManagementReducer from './ContractManagement/ContractManagementSlice';
import vendorManagementReducer from './VendorManagement/VendorManagementSlice'
import eoiManagementReducer from './EoiManagement/EoiManagementSlice'
import purchaseOrderReducer from './PurchaseOrder/PurchaseOrderSlice'
import goodsReceiptReducer from './GoodsReceiptService/GoodsReceiptSlice'

export const store = configureStore({
  reducer: {
    contractManagement: contractManagementReducer,
    vendorManagement: vendorManagementReducer,
    eoiManagement: eoiManagementReducer,
    purchaseOrder: purchaseOrderReducer,
    goodsReceipt: goodsReceiptReducer
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;