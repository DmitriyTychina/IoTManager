#pragma once
#include "Global.h"
#include "classes/IoTItem.h"
// define см. в Const.h

#if defined(Dev_Utils) && Dev_Utils == 1 && defined(Dev_GetSize) && Dev_GetSize == 1
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem);
#else
#define DevPrint_ID_sizeRAM(data)
#endif // Dev_GetSize

// #if defined(Dev_Utils) && Dev_Utils == 1 && defined(Dev_XXX) && Dev_XXX == 1
// void DevPrint_ID_sizeRAM(IoTItem* myIoTItem);
// #else
// #define DevPrint_XXX(data)
// #endif // Dev_XXX
