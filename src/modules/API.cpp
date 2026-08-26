#include "ESPConfiguration.h"

void* getAPI_AnalogBtn(String subtype, String params);
void* getAPI_ButtonIn(String subtype, String params);
void* getAPI_Pcf8591(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_AnalogBtn(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_ButtonIn(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Pcf8591(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}