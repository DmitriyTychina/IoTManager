#include "ESPConfiguration.h"

void* getAPI_AnalogAdc(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_AnalogAdc(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}