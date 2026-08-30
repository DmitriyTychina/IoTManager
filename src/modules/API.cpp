#include "ESPConfiguration.h"

void* getAPI_AnalogBtn(String subtype, String params);
void* getAPI_BrokerMQTT(String subtype, String params);
void* getAPI_Buzzer(String subtype, String params);
void* getAPI_FTPModule(String subtype, String params);
void* getAPI_HttpGet(String subtype, String params);
void* getAPI_IRremote(String subtype, String params);
void* getAPI_Telegram_v2(String subtype, String params);
void* getAPI_DwinI(String subtype, String params);
void* getAPI_Lcd2004(String subtype, String params);
void* getAPI_Smi2_m(String subtype, String params);
void* getAPI_TM16XX(String subtype, String params);
void* getAPI_Ws2812b(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_AnalogBtn(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_BrokerMQTT(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Buzzer(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_FTPModule(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_HttpGet(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_IRremote(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Telegram_v2(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_DwinI(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Lcd2004(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Smi2_m(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_TM16XX(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Ws2812b(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}