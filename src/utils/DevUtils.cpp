#include "utils/DevUtils.h"
// define см. в Const.h
#if defined(Dev_Utils) && Dev_Utils == 1

#if defined(Dev_GetSize) && Dev_GetSize == 1
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem) {
    if (myIoTItem)
        SerialPrint(F("Dev"), "ID:sizeRAM", myIoTItem->getID() + ":" + String(myIoTItem->getSize()));
};
#endif // defined(Dev_GetSize) && Dev_GetSize == 1

#endif // #if defined(Dev_Utils) && Dev_Utils == 1
