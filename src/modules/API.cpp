#include "ESPConfiguration.h"

void* getAPI_Timer(String subtype, String params);
void* getAPI_BL0937(String subtype, String params);
void* getAPI_BL0942(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI;
if ((tmpAPI = getAPI_Timer(subtype, params)) != nullptr) return tmpAPI;
if ((tmpAPI = getAPI_BL0937(subtype, params)) != nullptr) return tmpAPI;
if ((tmpAPI = getAPI_BL0942(subtype, params)) != nullptr) return tmpAPI;
return nullptr;
}