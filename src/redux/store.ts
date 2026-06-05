import { configureStore } from '@reduxjs/toolkit';
import contractManagementReducer from './ContractManagement/ContractManagementSlice';
import eoiManagementReducer from './EoiManagement/EoiManagementSlice'
import goodsReceiptReducer from './GoodsReceiptService/GoodsReceiptSlice'
import purchaseOrderReducer from './PurchaseOrder/PurchaseOrderSlice'
import quotationsReducer from './Quotation/Quatation'
import rfqReducer from './RFQ/RfqSlice'
import vendorManagementReducer from './VendorManagement/VendorManagementSlice'

export const store = configureStore({
  reducer: {
    contractManagement: contractManagementReducer,
    vendorManagement: vendorManagementReducer,
    eoiManagement: eoiManagementReducer,
    purchaseOrder: purchaseOrderReducer,
    goodsReceipt: goodsReceiptReducer,
    rfq: rfqReducer,
    quotations:quotationsReducer
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;