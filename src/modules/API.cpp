#include "ESPConfiguration.h"

void* getAPI_Timer(String subtype, String params);
void* getAPI_Variable(String subtype, String params);
void* getAPI_VButton(String subtype, String params);
void* getAPI_AnalogAdc(String subtype, String params);
void* getAPI_ButtonIn(String subtype, String params);
void* getAPI_ButtonOut(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_Timer(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Variable(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_VButton(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_AnalogAdc(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_ButtonIn(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_ButtonOut(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}