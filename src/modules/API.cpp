#include "ESPConfiguration.h"

void* getAPI_Pcf8591(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_Pcf8591(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}