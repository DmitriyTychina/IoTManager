#include "ESPConfiguration.h"

void* getAPI_Nextion(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_Nextion(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}