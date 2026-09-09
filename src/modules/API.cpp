#include "ESPConfiguration.h"

void* getAPI_ButtonIn(String subtype, String params);
void* getAPI_ButtonOut(String subtype, String params);
void* getAPI_Buzzer(String subtype, String params);
void* getAPI_Multitouch(String subtype, String params);
void* getAPI_TM16XX(String subtype, String params);
void* getAPI_A02Distance(String subtype, String params);
void* getAPI_AhtXX(String subtype, String params);
void* getAPI_AnalogAdc(String subtype, String params);
void* getAPI_Bme280(String subtype, String params);
void* getAPI_Bmp280(String subtype, String params);
void* getAPI_Dht1122(String subtype, String params);
void* getAPI_Ds18b20(String subtype, String params);
void* getAPI_RCswitch(String subtype, String params);
void* getAPI_Sonar(String subtype, String params);
void* getAPI_Benchmark(String subtype, String params);
void* getAPI_Cron(String subtype, String params);
void* getAPI_Loging(String subtype, String params);
void* getAPI_LogingDaily(String subtype, String params);
void* getAPI_LogingHourly(String subtype, String params);
void* getAPI_IoTMath(String subtype, String params);
void* getAPI_Ping(String subtype, String params);
void* getAPI_Timer(String subtype, String params);
void* getAPI_UpdateServer(String subtype, String params);
void* getAPI_Variable(String subtype, String params);
void* getAPI_VButton(String subtype, String params);

void* getAPI(String subtype, String params) {
void* tmpAPI; void* foundAPI = nullptr;
if ((tmpAPI = getAPI_ButtonIn(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_ButtonOut(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Buzzer(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Multitouch(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_TM16XX(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_A02Distance(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_AhtXX(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_AnalogAdc(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Bme280(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Bmp280(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Dht1122(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Ds18b20(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_RCswitch(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Sonar(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Benchmark(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Cron(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Loging(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_LogingDaily(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_LogingHourly(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_IoTMath(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Ping(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Timer(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_UpdateServer(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_Variable(subtype, params)) != nullptr) foundAPI = tmpAPI;
if ((tmpAPI = getAPI_VButton(subtype, params)) != nullptr) foundAPI = tmpAPI;
return foundAPI;
}