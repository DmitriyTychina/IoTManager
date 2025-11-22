#pragma once

#include "Global.h"
#include "MqttClient.h"

#if !defined (LIBRETINY) && defined (esp32_wifirep)
void addPortMap(String TCP_UDP, String maddr, u16_t mport, String daddr, u16_t dport);
#endif

boolean isNetworkActive();
uint8_t getNumAPClients();
// bool startAPMode();
// #ifndef WIFI_ASYNC
// void routerConnect();
// boolean RouterFind(std::vector<String> jArray);
// #else
// void handleScanResults();
// void WiFiUtilsItit();
// void connectToNextNetwork();
// void checkConnection();
// void ScanAsync();
// #endif

uint8_t RSSIquality();
//extern void wifiSignalInit();
#ifdef LIBRETINY
String httpGetString(HTTPClient &http);
#endif

#define max_STAdisconnects 3
#define max_SCANignore 5
#define SCAN_Period 20000
#define default_passwordAP "pass1234" // не надо создавать AP без авторизации по соображениям безопасности

// Режимы работы точки доступа AP (с возможностью управления из сценария)
enum sysWiFiApMode {
    sysWiFi_AP_AUTO,        // Автоматический (AP включается при отсутствии подключения к WiFi)
    sysWiFi_AP_ON,          // Всегда включена
    sysWiFi_AP_OFF          // Всегда выключена
};

// Режимы работы Wi-Fi STA (с возможностью управления из сценария)
enum sysWiFiSTAMode {
    sysWiFi_STA_AUTO,       // Автоматический (По приоритету (основная → резервная1 → резервная2 и т. д.))
    // sysWiFi_STA_ON,         // Всегда включена //убираем - то же что и sysWiFi_STA_AUTO
    sysWiFi_STA_OFF         // Всегда выключена
};

// // Флаги управления работой точки доступа AP
// enum sysWiFiAPFlags {
//     sysWiFi_AP_FLAG_NOP,        // Ничего не делать
//     // sysWiFi_AP_FLAG_INI_ON,     // Для первого запуска (инициализация и запуск)
//     sysWiFi_AP_FLAG_ON,         // Включить точку доступа
//     sysWiFi_AP_FLAG_OFF_Soft,   // Выключить точку доступа после отключения клиентов
//     sysWiFi_AP_FLAG_OFF_Hard,   // Выключить точку доступа не дожидаясь отключения клиентов
// };

// // Флаги управления работой Wi-Fi STA
// enum sysWiFiSTAFlags {
//     sysWiFi_STA_FLAG_NOP,       // Ничего не делать
//     // sysWiFi_STA_FLAG_INI_ON,    // Для первого запуска (инициализация и запуск)
//     // sysWiFi_STA_FLAG_NEXT,      // Следующая сеть
//     sysWiFi_STA_FLAG_ON,        // Включить STA
//     sysWiFi_STA_FLAG_OFF_Soft,  // Выключить STA после отключения клиентов
//     sysWiFi_STA_FLAG_OFF_Hard   // Выключить STA не дожидаясь отключения клиентов
// };

// Объединение флагов для событий Wi-Fi
union WiFiFlagsUnion_TS {
    struct {
        // sysWiFiAPFlags APFlag : 2;     // 2 бита для AP флагов
        // sysWiFiSTAFlags STAFlag : 2;   // 2 бита для STA флагов
        bool ScanRepeat : 1;
        bool ScanToWeb : 1;
 #if defined(ESP32)
        bool EVENT_WIFI_CONF_NOT_READY : 1;
 #endif
        bool EVENT_STA_Disconnect : 1;
        bool EVENT_STA_Connected : 1;
        bool EVENT_STA_Got_IP : 1;
        // bool EVENT_SCAN_DONE : 1;
        bool EVENT_AP_Connected : 1;
    } flag;
    uint32_t rawValue = 0;
};

struct WiFi_config {
    bool isNetServicesInitet = false;
    // STA
    sysWiFiSTAMode currentSysWiFiSTAMode = sysWiFi_STA_AUTO;
    std::vector<String> _ssidList;
    std::vector<String> _passwordList;
    uint8_t _indexCurrentSSID = 0;
    // AP
    sysWiFiApMode currentSysWiFiAPMode = sysWiFi_AP_AUTO;
    String _ssidAP;
    String _passwordAP;
    // Scan
    // bool ScanToWeb = false;
    std::vector<String> _scanList;
    std::vector<int> _scanIgnoreList;
};

extern WiFi_config s_WiFi_config;

extern void InitNetServices();
extern void DeinitNetServices();

void SysWiFi_preinit( bool enable );
void SysWiFi_init();
// void SysWiFi_start();
void sysWiFi_StartPeriodicalScan( bool repeat );
