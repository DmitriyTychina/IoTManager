#include "ESPConfiguration.h"

void* getAPI_AnalogBtn(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_AnalogBtn(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}