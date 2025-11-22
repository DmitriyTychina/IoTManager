#pragma once
#include "Global.h"
#include "utils/WiFiUtils.h"
#include "DeviceList.h"
#include "ESPConfiguration.h"
#include "UpgradeFirm.h"

#define ssidList_phrase_first "[Выберите сеть]"
#define ssidList_phrase_last "[Удалить текущую]"

struct WiFi_config;
extern WiFi_config s_WiFi_config;


#ifdef STANDARD_WEB_SOCKETS
extern void standWebSocketsInit();
extern void standWebSocketsDeinit();
extern void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length);
#ifdef ESP32
extern void hexdump(const void* mem, uint32_t len, uint8_t cols);
#endif
#endif

void publishStatusWs(const String& topic, const String& data);
void publishJsonWs(const String& topic, String& json);
void periodicWsSend();

void sendFileToWsByFrames(const String& filename, const String& header, const String& json, int client_id, size_t frameSize);
void sendStringToWs(const String& header, String& payload, int client_id);
void disconnectWSClient(uint8_t client_id);
void sendDeviceList(uint8_t num);
int getNumWSClients();
void send_settin_ssidli_to_ws(int num = -1);
