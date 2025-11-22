#include "utils/WiFiUtils.h"
#include <vector>
#if defined(ESP32)
// #include <esp_task_wdt.h>
#include "esp_wifi.h"
#endif
#include "DebugTrace.h"

// #define TRIESONE 20 // количество секунд ожидания подключения к одной сети из несколких
// #define TRIES 30    // количество секунд ожидания подключения сети если она одна

#if defined(LIBRETINY)
#include <libretiny.h>
#include <wifi.h>
#endif

#if defined(esp32_wifirep)
#include "lwip/lwip_napt.h"
// #include "lwip/ip_route.h"
#define PROTO_TCP 6
#define PROTO_UDP 17

IPAddress stringToIp(String strIp)
{
  IPAddress ip;
  ip.fromString(strIp);
  return ip;
}
#endif

#if !defined (LIBRETINY) && defined (esp32_wifirep)
void addPortMap(String TCP_UDP, String maddr, u16_t mport, String daddr, u16_t dport)
{
#if defined(esp32_wifirep)
  uint8_t tcp_udp;
  if (TCP_UDP == "TCP")
    tcp_udp = PROTO_TCP;
  else if (TCP_UDP == "UDP")
    tcp_udp = PROTO_UDP;
  else
    SerialPrint("E", "WIFI", "Add port map: ERROR, Must be 'TCP' or 'UDP'");

  ip_portmap_add(tcp_udp, stringToIp(maddr), mport, stringToIp(daddr), dport);
  SerialPrint("I", "WIFI", "Add port map: " + String(tcp_udp) + ", " + maddr + ":" + String(mport) + " -> " + daddr + ":" + String(dport));
#else
  SerialPrint("E", "WIFI", "Add port map: ERROR, change board to esp32_wifirep");
#endif
}
#endif

// std::vector<String> _ssidList;
// std::vector<String> _passwordList;


// #ifdef WIFI_ASYNC
// // номер сети, для перебирания в момент подключения к сетям из массива
// volatile uint8_t currentNetwork = 0;
// volatile bool wifiConnecting = false;
// volatile uint8_t connectionAttempts = 0;
// //------------------------------------------
// // Обработчики событий Wi-Fi
// //------------------------------------------
// void WiFiEvent(arduino_event_t *event)
// {
//   switch (event->event_id)
//   {
// #if defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   case ARDUINO_EVENT_WIFI_STA_CONNECTED:
// #else
//   case SYSTEM_EVENT_STA_CONNECTED:
// #endif
//     // Подключились к STA
//     SerialPrint("I", "WIFI", "Connected to AP: " + WiFi.SSID());
//     // TODO если подключились, но не получили IP что будет?
//     break;
// #if defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   case ARDUINO_EVENT_WIFI_STA_GOT_IP:
// #else
//   case SYSTEM_EVENT_STA_GOT_IP:
// #endif
//     // Получили IP от роутера
//     // wifiReconnectTicker.detach();
//     ts.remove(WIFI_SCAN);
//     ts.remove(WIFI_HANDL);
// #ifdef LIBRETINY
//     SerialPrint("I", "WIFI", "http://" + ipToString(WiFi.localIP()));
//     jsonWriteStr(settingsFlashJson, "ip", ipToString(WiFi.localIP()));
// #else
//     SerialPrint("I", "WIFI", "http://" + WiFi.localIP().toString());
//     jsonWriteStr(settingsFlashJson, "ip", WiFi.localIP().toString());
// #endif
//     createItemFromNet("onWifi", "1", 1);
//     // запускаем MQTT
//     mqttInit();
//     SerialPrint("I", F("WIFI"), F("Network Init"));

//     bool postMsgTelegram;
//     if (!jsonRead(settingsFlashJson, "debugTraceMsgTlgrm", postMsgTelegram, false)) postMsgTelegram = 1;
//     sendDebugTraceAndFreeMemory(postMsgTelegram);

//     // Отключаем AP при успешном подключении
//     WiFi.softAPdisconnect(true);
//     break;
// #if defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
// #else
//   case SYSTEM_EVENT_STA_DISCONNECTED:
// #endif
//     // Отключились от STA
//     SerialPrint("I", "WIFI", "Disconnected from STA");
//     // Завершаем задачу проверки сети
//     ts.remove(WIFI_HANDL);
//     if (wifiConnecting)
//     { // если у нас ещё не закончились попытки подключения, то перезапускаем задачу
//       Serial.print(".");
//       checkConnection();
//       // wifiReconnectTicker.once_ms(WIFI_CHECK_INTERVAL, checkConnection);
//     }
//     else
//     { // если попытки подключения исчерпаны, то переходим в AP
//       sendDebugTraceAndFreeMemory(false);
//       startAPMode();
//     }
//     break;
// #if defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   case ARDUINO_EVENT_WIFI_SCAN_DONE:
// #else
//   case SYSTEM_EVENT_SCAN_DONE:
// #endif
//     if (WiFi.scanComplete() >= 0) {
//       Serial.println("Valid Scan completed");
//       handleScanResults();
//       WiFi.scanDelete(); // Очищаем только при успешном сканировании
//     } else {
//       //Serial.println("Empty scan or error");
//       //WiFi.scanDelete(); // Принудительная очистка буфера
//     }
//     // Завершилось сканирование сетей
//     //Serial.println("Scan completed");
//     //handleScanResults();
//     break;
//   }
// }

//------------------------------------------
// Обработка результатов сканирования
//------------------------------------------
// void handleScanResults()
// {
//   ssidListHeapJson = "{}";
//   _ssidList.clear();
//   _passwordList.clear();
//   jsonReadArray(settingsFlashJson, "routerssid", _ssidList);
//   jsonReadArray(settingsFlashJson, "routerpass", _passwordList);
//   int16_t numNetworks = WiFi.scanComplete();
//   if (numNetworks <= 0)
//   {
//     SerialPrint("I", "WIFI", "no networks found");
//     return;
//   }

//   // Ищем известные сети
//   int connectNumNet = -1;
//   // SerialPrint("I", "WIFI", "Count found: "+numNetworks);
//   for (int n = 0; n < numNetworks; ++n)
//   {
//     String ssid = WiFi.SSID(n);
//     jsonWriteStr_(ssidListHeapJson, String(n), ssid);
//     for (size_t i = 0; i < _ssidList.size(); i++)
//     {
//       if (ssid == _ssidList[i])
//       {
//         Serial.printf("Found known network: %s\n", _ssidList[i]);
//         if (connectNumNet < 0)
//           connectNumNet = i;
//       }
//     }
//     // if
//   }
//   sendStringToWs("ssidli", ssidListHeapJson, -1);  
//   SerialPrint("I", "WIFI", "Scan Found: " + ssidListHeapJson);
//   if (connectNumNet >= 0 && !isNetworkActive())
//   {
//     // ts.remove(WIFI_SCAN);
//     connectToNextNetwork();
//   }
//   // checkConnection();
//   // connectToSTA(_ssidList[connectNumNet], _passwordList[connectNumNet]);
//   WiFi.scanDelete();
// }

// void WiFiUtilsItit()
// {
// #if !defined LIBRETINY
// #if defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   WiFi.setAutoReconnect(false);
// #else
//   WiFi.setAutoConnect(false);
// #endif
//   WiFi.persistent(true); // Сохраняет текущую сеть при сканировании
//   WiFi.setSleep(true);
// #endif
//   WiFi.mode(WIFI_STA);
//   // WiFi.onEvent(WiFiEvent);
//   _ssidList.clear();
//   _passwordList.clear();
//   jsonReadArray(settingsFlashJson, "routerssid", _ssidList);
//   jsonReadArray(settingsFlashJson, "routerpass", _passwordList);

//   if (_ssidList.empty() || _passwordList.empty())
//   {
//     SerialPrint("E", "WIFI", "No networks configured");
//     startAPMode();
//     return;
//   }
//   currentNetwork = 0;
//   connectionAttempts = 0;
//   connectToNextNetwork();
// }

// void connectToNextNetwork()
// {
//   // все сети перебрали
//   if (currentNetwork >= _ssidList.size())
//   {
//     SerialPrint("I", "WIFI", "All networks tried");
//     ts.remove(WIFI_HANDL);
//     startAPMode();
//     return;
//   }

//   wifiConnecting = true;
//   // connectionAttempts++;

//   const char *ssid = _ssidList[currentNetwork].c_str();
//   const char *pass = _passwordList[currentNetwork].c_str();
//   // Пробуем подключиться к сети
//   SerialPrint("I", "WIFI", "Connecting to: " + String(ssid));
//   WiFi.begin(ssid, pass);

// #if defined(ESP32)
//   WiFi.setTxPower(WIFI_POWER_19_5dBm);
// #elif defined(ESP8266)
//   WiFi.setOutputPower(20.5);
// #endif
//   // проверяем статус подключения и перебираем сети если таймаут не вышел
//   checkConnection();

//   // wifiReconnectTicker.once_ms(WIFI_CHECK_INTERVAL, checkConnection);
// }

// void checkConnection()
// {
//   ts.add(
//       WIFI_HANDL, 1000,
//       [&](void *)
//       {
//         connectionAttempts++;
//         if (WiFi.status() == WL_CONNECTED)
//         {
//           connectionAttempts = 0;
//           wifiConnecting = false;
//           return;
//         }

//         if (connectionAttempts >= (_ssidList.size() > 1 ? TRIESONE : TRIES))
//         {
//           SerialPrint("I", "WIFI", "Max attempts reached");
//           currentNetwork++;
//           connectionAttempts = 0;
//           wifiConnecting = false;
//         }

//         if (wifiConnecting)
//         {
// #ifdef ESP8266
//           if (WiFi.status() == WL_CONNECT_FAILED || WiFi.status() == WL_WRONG_PASSWORD)
// #else
//           if (WiFi.status() == WL_CONNECT_FAILED)
// #endif
//           {
//             SerialPrint("E", "WIFI", "Connection failed, wrong password?");
//             jsonWriteInt(errorsHeapJson, "passer", 1);
//             currentNetwork++;
//             connectionAttempts = 0;
//           }

//           // wifiReconnectTicker.once_ms(WIFI_CHECK_INTERVAL, checkConnection);
//         }

//         if (!wifiConnecting)
//         {
//           connectToNextNetwork();
//         }
//       },
//       nullptr, true);
// }

//------------------------------------------
// Неблокирующее подключение к STA
//------------------------------------------
// void connectToSTA(const char *ssid, const char *pass)
// {
//   if (isNetworkActive())
//     return;
//   SerialPrint("I", "WIFI", "Connecting to ... " + String(ssid));
//   // SerialPrint("I", "WIFI", "pass connect: " + _passwordList[i]);
//   WiFi.begin(ssid, pass);
// #if defined(ESP32)
//   WiFi.setTxPower(WIFI_POWER_19_5dBm);
// #elif defined(ESP8266)
//   WiFi.setOutputPower(20.5);
// #endif
// }

// void ScanAsync()
// {
//   // bool res = false;
//   int n = WiFi.scanComplete();
//   SerialPrint("I", "WIFI", "scan result: " + String(n, DEC));

//   if (n == -1)
//   { // Сканирование все еще выполняется
//     SerialPrint("I", "WIFI", "scanning in progress");
//   }
//   else
//   {
//     SerialPrint("I", "WIFI", "start scanning");
//     WiFi.scanNetworks(true, false);
//   }
// }
// #else //WIFI_ASYNC

// void routerConnect()
// {
// #if defined(esp32_wifirep)
// //  Set custom dns server address for dhcp server
// #define MY_DNS_IP_ADDR 0xC0A80401 // 192.168.4.1 // 0x08080808 // 8.8.8.8
//   ip_addr_t dnsserver;

//   String _ssidAP = jsonReadStr(settingsFlashJson, "apssid");
//   String _passwordAP = jsonReadStr(settingsFlashJson, "appass");
//   int _chanelAP = 0;
//   jsonRead(settingsFlashJson, "wifirep_apchanel", _chanelAP);
//   if (_chanelAP == 0)
//     _chanelAP = 7;

//   // WiFi.begin(ssid, password);
//   WiFi.mode(WIFI_AP_STA);

//   String s_apip = "";
//   bool ap_ip = jsonRead(settingsFlashJson, "wifirep_apip", s_apip);
//   if (ap_ip && s_apip != "")
//   {
//     WiFi.softAPConfig(stringToIp(s_apip), stringToIp(s_apip), stringToIp("255.255.255.0"));
//     // bool softAPConfig(IPAddress local_ip, IPAddress gateway, IPAddress subnet, IPAddress dhcp_lease_start = (uint32_t) 0);
//     dnsserver.u_addr.ip4.addr = stringToIp(s_apip);
//   }
//   else
//     dnsserver.u_addr.ip4.addr = htonl(MY_DNS_IP_ADDR);

//   dnsserver.type = IPADDR_TYPE_V4;
//   dhcps_dns_setserver(&dnsserver);

//   WiFi.softAP(_ssidAP.c_str(), _passwordAP.c_str(), _chanelAP, 0, 5);
//   jsonWriteStr(settingsFlashJson, "ip", WiFi.softAPIP().toString());
//   SerialPrint("I", "WIFI", "AP SSID: " + WiFi.softAPSSID());
//   SerialPrint("I", "WIFI", "AP IP: " + WiFi.softAPIP().toString());
//   SerialPrint("I", "WIFI", "AP pass: " + _passwordAP);

//   String s_staip = "";
//   bool static_ip = jsonRead(settingsFlashJson, "wifirep_staip", s_staip);
//   String s_gateway = jsonReadStr(settingsFlashJson, "wifirep_gateway");
//   String s_netmask = jsonReadStr(settingsFlashJson, "wifirep_netmask");
//   String s_dns = jsonReadStr(settingsFlashJson, "wifirep_dns");

//   if (static_ip == true && s_staip != "")
//   {
//     SerialPrint("I", "WIFI", "Use static IP");
//     WiFi.config(stringToIp(s_staip), stringToIp(s_gateway), stringToIp(s_netmask), stringToIp(s_dns));
//     // bool config(IPAddress local_ip, IPAddress gateway, IPAddress subnet, IPAddress dns1 = (uint32_t)0x00000000, IPAddress dns2 = (uint32_t)0x00000000);
//     SerialPrint("I", "WIFI", "Static IP: " + s_staip);
//     SerialPrint("I", "WIFI", "Gateway: " + s_gateway);
//     SerialPrint("I", "WIFI", "Netmask: " + s_netmask);
//     SerialPrint("I", "WIFI", "DNS: " + s_dns);
//   }
// #else
//   WiFi.mode(WIFI_STA);
// #endif

// #if  !defined LIBRETINY  
// #if defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   WiFi.setAutoReconnect(false);
// #else
//   WiFi.setAutoConnect(false);
// #endif
//   WiFi.persistent(false);
// #endif
// /*     String s_staip = "192.168.2.62";
//     String s_gateway = "192.168.2.1";
//     String s_netmask = "255.255.255.0";
//     String s_dns = "192.168.2.1";
//     SerialPrint("I", "WIFI", "Use static IP");
//     WiFi.config(stringToIp(s_staip), stringToIp(s_gateway), stringToIp(s_netmask), stringToIp(s_dns));
//     // bool config(IPAddress local_ip, IPAddress gateway, IPAddress subnet, IPAddress dns1 = (uint32_t)0x00000000, IPAddress dns2 = (uint32_t)0x00000000);
//     SerialPrint("I", "WIFI", "Static IP: " + s_staip);
//     SerialPrint("I", "WIFI", "Gateway: " + s_gateway);
//     SerialPrint("I", "WIFI", "Netmask: " + s_netmask);
//     SerialPrint("I", "WIFI", "DNS: " + s_dns); */
//   //WiFi.mode(WIFI_STA);
//   byte triesOne = TRIESONE;

//   std::vector<String> _ssidList;
//   std::vector<String> _passwordList;
//   jsonReadArray(settingsFlashJson, "routerssid", _ssidList);
//   jsonReadArray(settingsFlashJson, "routerpass", _passwordList);
//   if (_ssidList.size() > 1)
//     triesOne = TRIES;

//   if (_passwordList.size() == 0 && _ssidList[0] == "" && _passwordList[0] == "")
//   {
//     #ifndef LIBRETINY
//     WiFi.begin();
//     #endif
//   }
//   else
//   {
//     WiFi.begin(_ssidList[0].c_str(), _passwordList[0].c_str());
// #if defined (ESP32)
//     WiFi.setTxPower(WIFI_POWER_19_5dBm);
// #elif defined (ESP8266)
//     WiFi.setOutputPower(20.5);
// #endif
//     String _ssid;
//     String _password;
//     for (int8_t i = 0; i < _ssidList.size(); i++)
//     {
//       _ssid = _ssid + _ssidList[i] + "; ";
//     }
//     for (int8_t i = 0; i < _passwordList.size(); i++)
//     {
//       _password = _password + _passwordList[i] + "; ";
//     }
//     SerialPrint("I", "WIFI", "ssid list: " + _ssid);
//     SerialPrint("I", "WIFI", "pass list: " + _password);
//   }
//   for (size_t i = 0; i < _ssidList.size(); i++)
//   {
//     triesOne = TRIESONE;
//     if (WiFi.status() == WL_CONNECTED)
//       break;
//     WiFi.begin(_ssidList[i].c_str(), _passwordList[i].c_str());
//     SerialPrint("I", "WIFI", "ssid connect: " + _ssidList[i]);
//     SerialPrint("I", "WIFI", "pass connect: " + _passwordList[i]);
//     while (--triesOne && WiFi.status() != WL_CONNECTED)
//     {
// //            SerialPrint("I", "WIFI", ": " + String((int)WiFi.status()));
// #ifdef ESP8266
//       if (WiFi.status() == WL_CONNECT_FAILED || WiFi.status() == WL_WRONG_PASSWORD)
// #else
//       if (WiFi.status() == WL_CONNECT_FAILED)
// #endif
//       {
//         SerialPrint("E", "WIFI", "password is not correct");
//         triesOne = 1;
//         jsonWriteInt(errorsHeapJson, "passer", 1);
//         break;
//       }
// #if defined(ESP32)
//       //SerialPrint("I", "Task", "Resetting WDT...");
//        #if !defined(esp32c6_4mb) && !defined(esp32c6_8mb) //TODO esp32-c6 переписать esp_task_wdt_init
//       esp_task_wdt_reset();
//       #endif
// #endif
//       Serial.print(".");
//       delay(1000);
//     }
//     Serial.println("");
//   }

//   if (WiFi.status() != WL_CONNECTED)
//   {
//     Serial.println("");
//     startAPMode();
//   }
//   else
//   {
//     Serial.println("");
// #ifdef LIBRETINY
//     SerialPrint("I", "WIFI", "http://" + ipToString(WiFi.localIP()));
//     jsonWriteStr(settingsFlashJson, "ip", ipToString(WiFi.localIP()));
// #else
//     SerialPrint("I", "WIFI", "http://" + WiFi.localIP().toString());
//     jsonWriteStr(settingsFlashJson, "ip", WiFi.localIP().toString());
// #endif
//     createItemFromNet("onWifi", "1", 1);

// #if defined(esp32_wifirep)
//     // Enable DNS (offer) for dhcp server
//     dhcps_offer_t dhcps_dns_value = OFFER_DNS;
//     dhcps_set_option_info(6, &dhcps_dns_value, sizeof(dhcps_dns_value));
//     u32_t napt_netif_ip;
//     if (ap_ip && s_apip != "")
//       napt_netif_ip = stringToIp(s_apip);
//     else
//     {
//       napt_netif_ip = 0xC0A80401; // Set to ip address of softAP netif (Default is 192.168.4.1)
//       napt_netif_ip = htonl(napt_netif_ip);
//     }
//     // get_esp_interface_netif(ESP_IF_WIFI_AP)
//     ip_napt_enable(napt_netif_ip, 1);
//     // ip_napt_enable_no(ESP_IF_WIFI_AP, 1);

// #endif

//     mqttInit();
//   }
//   SerialPrint("I", F("WIFI"), F("Network Init"));
// }
// #endif
// bool startAPMode()
// {
// #ifdef WIFI_ASYNC
//   wifiConnecting = false;
//   currentNetwork = 0;
//   connectionAttempts = 0;
// #endif
//   SerialPrint("I", "WIFI", "AP Mode");

//   WiFi.disconnect();
//   WiFi.mode(WIFI_AP);

//   String _ssidAP = jsonReadStr(settingsFlashJson, "apssid");
//   String _passwordAP = jsonReadStr(settingsFlashJson, "appass");
//   if (_passwordAP == "")
//     WiFi.softAP(_ssidAP.c_str(), NULL, 6);
//   else
//     WiFi.softAP(_ssidAP.c_str(), _passwordAP.c_str(), 6);
//   IPAddress myIP = WiFi.softAPIP();
// #ifdef LIBRETINY
//   SerialPrint("I", "WIFI", "AP IP: " + ipToString(myIP));
//   jsonWriteStr(settingsFlashJson, "ip", ipToString(myIP));
// #else
//   SerialPrint("I", "WIFI", "AP IP: " + myIP.toString());
//   jsonWriteStr(settingsFlashJson, "ip", myIP.toString());
// #endif
//   if (jsonReadInt(errorsHeapJson, "passer") != 1)
//   {
//     ts.add(
//         WIFI_SCAN, 30 * 1000,
//         [&](void *)
//         {
// #ifndef WIFI_ASYNC
//           std::vector<String> jArray;
//           jsonReadArray(settingsFlashJson, "routerssid", jArray);
//           for (int8_t i = 0; i < jArray.size(); i++)
//           {
//             SerialPrint("I", "WIFI", "scanning for " + jArray[i]);
//           }
//           if (RouterFind(jArray))
//           {
//             ts.remove(WIFI_SCAN);
//             WiFi.scanDelete();
//             routerConnect();
//           }
// #else
//           ScanAsync();
// #endif
//         },
//         nullptr, true);
//   }
//   return true;
// }

// #ifndef WIFI_ASYNC
// boolean RouterFind(std::vector<String> jArray)
// {
//   bool res = false;
//   int n = WiFi.scanComplete();
//   SerialPrint("I", "WIFI", "scan result: " + String(n, DEC));

//   if (n == -2)
//   { // Сканирование не было запущено, запускаем
//     SerialPrint("I", "WIFI", "start scanning");
//     WiFi.scanNetworks(true, false); // async, show_hidden
//   }

//   else if (n == -1)
//   { // Сканирование все еще выполняется
//     SerialPrint("I", "WIFI", "scanning in progress");
//   }

//   else if (n == 0)
//   { // ни одна сеть не найдена
//     SerialPrint("I", "WIFI", "no networks found");
//     WiFi.scanNetworks(true, false);
//   }
//   else if (n > 0)
//   {
//     for (int8_t i = 0; i < n; i++)
//     {
//       for (int8_t k = 0; k < jArray.size(); k++)
//       {
//         if (WiFi.SSID(i) == jArray[k])
//         {
//           res = true;
//         }
//       }
//       // SerialPrint("I", "WIFI", (res ? "*" : "") + String(i, DEC) + ") " + WiFi.SSID(i));
//       jsonWriteStr_(ssidListHeapJson, String(i), WiFi.SSID(i));

//       // String(WiFi.RSSI(i)
//     }
//   }
//   SerialPrint("I", "WIFI", ssidListHeapJson);
//   WiFi.scanDelete();
//   return res;
// }
// #endif


// шаблон
#if defined(ESP8266)
#elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
#else // остальные ESP32
#endif


//------------------------------------------
// Утилиты Wi-Fi
//------------------------------------------
inline void WiFiUtils_WiFiSetPowerMax(){
#if defined (ESP32)
  WiFi.setTxPower(WIFI_POWER_19_5dBm);
#elif defined (ESP8266)
  WiFi.setOutputPower(20.5);
#endif
}

inline void WiFiUtils_WiFiSetSleep( bool b ){
  WiFi.setSleep(b);
}

inline void WiFiUtils_WiFiSetAutoConnect( bool b )
{
#if !defined(LIBRETINY)
  WiFi.setAutoConnect(b);
#endif
}

inline void WiFiUtils_WiFiSetAutoReconnect( bool b )
{
  WiFi.setAutoReconnect(b);
}

inline void WiFiUtils_WiFiSetPersistent( bool b )
{
#if !defined(LIBRETINY)
  WiFi.persistent(b);
#endif
}

boolean isNetworkActive()
{
  return WiFi.status() == WL_CONNECTED;
}

uint8_t getNumAPClients()
{
  return WiFi.softAPgetStationNum();
}

uint8_t RSSIquality()
{
  uint8_t res = 0;
  if (isNetworkActive())
  {
    int rssi = WiFi.RSSI();
    if (rssi >= -50)
    {
      res = 6; //"Excellent";
    }
    else if (rssi < -50 && rssi >= -60)
    {
      res = 5; //"Very good";
    }
    else if (rssi < -60 && rssi >= -70)
    {
      res = 4; //"Good";
    }
    else if (rssi < -70 && rssi >= -80)
    {
      res = 3; //"Low";
    }
    else if (rssi < -80 && rssi > -100)
    {
      res = 2; //"Very low";
    }
    else if (rssi <= -100)
    {
      res = 1; //"No signal";
    }
  }
  return res;
}

#ifdef LIBRETINY
String httpGetString(HTTPClient &http)
{
  String payload = "";
  int len = http.getSize();
  uint8_t buff[128] = {0};
  WiFiClient *stream = http.getStreamPtr();

  // read all data from server
  while (http.connected() && (len > 0 || len == -1))
  {
    // get available data size
    size_t size = stream->available();

    if (size)
    {
      // read up to 128 byte
      int c = stream->readBytes(buff, ((size > sizeof(buff)) ? sizeof(buff) : size));

      // write it to Serial
      //   Serial.write(buff,c);

      // payload += String((char*)buff);
      char charBuff[c + 1];        // Create a character array with space for null terminator
      memcpy(charBuff, buff, c);   // Copy the data to the character array
      charBuff[c] = '\0';          // Null-terminate the character array
      payload += String(charBuff); // Append the character array to the payload

      if (len > 0)
      {
        len -= c;
      }
    }
    delay(1);
  }
  return payload;
}
#endif

// volatile sysWiFiMode currentSysWiFiMode = sysWiFi_MODE_CONFIG;
// volatile uint8_t connectionAttempts = 0;
// volatile sysWiFiAPFlags f_SysWiFiAPFlags = sysWiFi_AP_FLAG_NOP;     // флаг что нужно изменить режим работы AP
// volatile sysWiFiSTAFlags f_SysWiFiSTAFlags = sysWiFi_STA_FLAG_NOP;  // флаг что нужно изменить режим работы STA
// volatile WiFiMode_t previousOPModeWiFi = WIFI_OFF;
volatile uint8_t cnt_STAdisconnects = 0;
volatile WiFiFlagsUnion_TS WiFiFlags;
volatile uint32_t last_time_Scan = 0;
volatile uint32_t last_time_manage_AP_STA = 0;
bool sysWiFi_isEnabled = false;
#if defined(ESP32)
bool WiFi_isReady = false;
int sysWiFi_ScanChannel = 1;
#endif
WiFi_config s_WiFi_config;

// WiFi_config s_WiFi_config;

void SysWiFi_start( String _ssid, String _pass );

bool isWiFi_MODE_CONFIG() {
    return s_WiFi_config._ssidList.empty();
}

bool isWiFi_MODE_SINGLE() {
    return s_WiFi_config._ssidList.size() == 1;
}

bool isWiFi_MODE_MULTI() {
    return s_WiFi_config._ssidList.size() > 1;
}

// bool isWiFi_CONFIG_is_actual() {
//   return s_WiFi_config.is_actual;
// }

void SysWiFi_manage_AP_STA( int num ) { // -3 manage only AP, -2 off STA, -1 persistent begin[0]
  last_time_manage_AP_STA = millis();
  SerialPrint("D", "WIFI", "SysWiFi_manage_AP_STA " + String(num));
  if (isWiFi_MODE_CONFIG() || s_WiFi_config.currentSysWiFiSTAMode == sysWiFi_STA_OFF || num == -2) {
    WiFi.enableSTA(false);
    // WiFiUtils_WiFiSetAutoReconnect(false);
    SerialPrint("I", "WIFI", "Disable STA");
  } else if ( num >= 0  && num < s_WiFi_config._ssidList.size()) {
    if (num != s_WiFi_config._indexCurrentSSID) {
      s_WiFi_config._indexCurrentSSID = num;
      // SerialPrint("D", "WIFI", "Pass = " + s_WiFi_config._passwordList[s_WiFi_config._indexCurrentSSID]);
      // SerialPrint("D", "WIFI", "AutoReconnect = " + String(WiFi.getAutoReconnect()? "true" : "false"));
      // SerialPrint("D", "WIFI", "AutoConnect = " + String(WiFi.getAutoConnect()? "true" : "false"));
      // SerialPrint("D", "WIFI", "Persistent = " + String(WiFi.getPersistent()? "true" : "false"));
      // WiFiUtils_WiFiSetAutoReconnect(true);
      WiFi.begin(s_WiFi_config._ssidList[s_WiFi_config._indexCurrentSSID].c_str(), s_WiFi_config._passwordList[s_WiFi_config._indexCurrentSSID].c_str());
    } else {
      WiFiUtils_WiFiSetAutoReconnect(true);
    }
#if !defined(LIBRETINY) // TODO WiFi LIBRETINY надо проверять
    if (!num)
      WiFi.begin(); // так быстрей
    else
#else
#endif
      SerialPrint("I", "WIFI", "Connecting to " + s_WiFi_config._ssidList[s_WiFi_config._indexCurrentSSID]);
  } else if (num == -1) {
    // if (!(WiFi.getMode() & WIFI_STA))
    //   WiFi.begin();
    s_WiFi_config._indexCurrentSSID = 0;
    SerialPrint("I", "WIFI", "SAVE WIFI and connecting to " + s_WiFi_config._ssidList[0]);
#if defined(LIBRETINY) // TODO WiFi LIBRETINY надо проверять
    WiFiUtils_WiFiSetAutoReconnect(true);
    WiFi.begin(s_WiFi_config._ssidList[0].c_str(), s_WiFi_config._passwordList[0].c_str());  // сохраняем в памяти ESP всегда основную [0] сеть
#else
    WiFiUtils_WiFiSetAutoConnect(true);
    WiFiUtils_WiFiSetAutoReconnect(true);
    WiFiUtils_WiFiSetPersistent(true);
    WiFi.begin(s_WiFi_config._ssidList[0], s_WiFi_config._passwordList[0]); // сохраняем в памяти ESP всегда основную [0] сеть
    WiFiUtils_WiFiSetPersistent(false);
#endif
  }

  if (s_WiFi_config.currentSysWiFiAPMode == sysWiFi_AP_OFF || (!isWiFi_MODE_CONFIG() && s_WiFi_config.currentSysWiFiAPMode == sysWiFi_AP_AUTO) && (WiFi.getMode() & WIFI_STA)) {
    WiFi.enableAP(false);
    SerialPrint("I", "WIFI", "Disable AP");
  } else if (!(WiFi.getMode() & WIFI_AP)) {
    WiFi.softAP(s_WiFi_config._ssidAP.c_str(), s_WiFi_config._passwordAP.c_str());
    SerialPrint("I", "WIFI", "Start AP: " + s_WiFi_config._ssidAP);
    SerialPrint("I", "WIFI", "Password AP: " + s_WiFi_config._passwordAP);
  }
}

void sysWiFi_StartPeriodicalScan( bool repeat ) {
  SerialPrint("D", "WIFI", "sysWiFi_StartPeriodicalScan " + String(repeat? "true" : "false"));
  if (!WiFiFlags.flag.ScanRepeat)
    last_time_Scan = millis() - SCAN_Period; // если еще не запущено, то запускаем
  if (repeat) {
    WiFiFlags.flag.ScanRepeat = true;
  } else {
    // s_WiFi_config.ScanToWeb = true;
    WiFiFlags.flag.ScanToWeb = true;
  }
  // SerialPrint("D", "WIFI", "WiFiFlags.flag.ScanRepeat = " + String(WiFiFlags.flag.ScanRepeat? "true" : "false"));
  // SerialPrint("D", "WIFI", "last_time_Scan = " + String(last_time_Scan));
  ts.enable(WIFI_HANDL);
}

void sysWiFi_StopPeriodicalScan( int num ) {
  // SerialPrint("D", "WIFI", "sysWiFi_StopPeriodicalScan");
  WiFiFlags.flag.ScanRepeat = false;
  // WiFi.mode((WiFiMode_t)((int)WiFi.getMode() & (int)WIFI_AP));
  SysWiFi_manage_AP_STA(num);
}

void cbScanComplete( int num ) {
  // int num = WiFi.scanComplete();
  if (num > 0) {
    bool res = false;
    int n = -1;
    int our = -1;
    uint8_t all_of_our = 0;
    int size_scanList = s_WiFi_config._scanList.size();
    for (int8_t i = 0; i < num; i++) {
      String ssid_i = WiFi.SSID(i);
      if (ssid_i.length() == 0)
        continue;
      for (int8_t k = 0; k < s_WiFi_config._ssidList.size(); k++) {
        if (ssid_i == s_WiFi_config._ssidList[k]) {
          our = k;
          all_of_our++;
          if (s_WiFi_config._scanIgnoreList[k] > 0) { // пропускаем сеть которая в игнор-листе
            s_WiFi_config._scanIgnoreList[k]--;
          } else {
            res = true;
            if (n < 0) // первая по списку приоритетней
              n = k;
          }
        } else {
          bool new_name = true;
          if (size_scanList && (ssid_i != "")) {
            for (int8_t k = 0; k < size_scanList; k++) {
              if (ssid_i == s_WiFi_config._scanList[k]) {
                new_name = false;
                break;
              }
            }
          }
          if (new_name) {
            s_WiFi_config._scanList.push_back(ssid_i);
            // SerialPrint("D", "WIFI_Scan", String(i, DEC) + "* " + ssid_i);
          }
        }
      }
      // SerialPrint("D", "WIFI_Scan", String(i, DEC) + ") " + WiFi.SSID(i));
    }
    // for (int8_t k = 0; k < s_WiFi_config._scanList.size(); k++) {
    //   SerialPrint("D", "WIFI_Scan", String(k, DEC) + "] " + s_WiFi_config._scanList[k]);
    // }
    if (WiFiFlags.flag.ScanRepeat) {
      if (res) {
        sysWiFi_StopPeriodicalScan(n);
      } else if (all_of_our == 1) { // если единственная, то игнорируем игнор-лист
        sysWiFi_StopPeriodicalScan(our);
      } else {
        SerialPrint("I", "WIFI", "Our WiFi is not available");
      }
    }
  }
  if (num >= 0)
    WiFi.scanDelete();

  // SerialPrint("D", "cbScanComplete", "WiFiFlags.flag.ScanRepeat = " + String(WiFiFlags.flag.ScanRepeat? "true" : "false"));
  // SerialPrint("D", "cbScanComplete", "last_time_Scan = " + String(last_time_Scan));
}

//------------------------------------------
// Обработчики событий Wi-Fi
//------------------------------------------
#if defined(ESP32) || defined(LIBRETINY)
void WiFiEvent(arduino_event_t *event)
#else
void WiFiEvent(WiFiEvent_t event)
#endif
{
#if defined(ESP8266)
  // SerialPrint("D", "WIFI Event", "Unknown event: " + String(event)); // Debug
  switch (event)
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//   switch (event->event_id)
#else // остальные ESP32
  // SerialPrint("D", "WIFI Event", "Unknown event: " + String(event->event_id)); // Debug
  switch (event->event_id)
#endif
  {
#if defined(ESP8266)
    case WIFI_EVENT_STAMODE_CONNECTED:
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     case ARDUINO_EVENT_WIFI_STA_CONNECTED:
#else // остальные ESP32
    case ARDUINO_EVENT_WIFI_STA_CONNECTED:
    // case SYSTEM_EVENT_STA_CONNECTED:
#endif
      // Подключились к STA
      WiFiFlags.flag.EVENT_STA_Connected = true;
      ts.enable(WIFI_HANDL);
      // SerialPrint("I", "WIFI Event", "Connected to AP: " + WiFi.SSID());
      // TODO если подключились, но не получили IP что будет?
      break;
#if defined(ESP8266)
    case WIFI_EVENT_STAMODE_GOT_IP:
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     case ARDUINO_EVENT_WIFI_STA_GOT_IP:
#else // остальные ESP32
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
    // case SYSTEM_EVENT_STA_GOT_IP:
#endif
      // Получили IP от роутера
      cnt_STAdisconnects = 0;
      if (s_WiFi_config._indexCurrentSSID < s_WiFi_config._scanIgnoreList.size())
        s_WiFi_config._scanIgnoreList[s_WiFi_config._indexCurrentSSID] = 0;
      WiFiFlags.flag.EVENT_STA_Got_IP = true;
      ts.enable(WIFI_HANDL);
//       SerialPrint("I", "WIFI Event", "Got IP");
// #ifdef LIBRETINY
//       SerialPrint("I", "WIFI", "http://" + ipToString(WiFi.localIP()));
//       jsonWriteStr(settingsFlashJson, "ip", ipToString(WiFi.localIP()));
// #else
//       SerialPrint("I", "WIFI", "http://" + WiFi.localIP().toString());
//       jsonWriteStr(settingsFlashJson, "ip", WiFi.localIP().toString());
// #endif
//       createItemFromNet("onWifi", "1", 1);
      break;
#if defined(ESP8266)
    case WIFI_EVENT_STAMODE_DISCONNECTED:
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
#else // остальные ESP32
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
    // case SYSTEM_EVENT_STA_DISCONNECTED:
#endif
      // Отключились от STA
      WiFiFlags.flag.EVENT_STA_Disconnect = true;
      ts.enable(WIFI_HANDL);
      // SerialPrint("D", "WIFI Event", "Disconnected from STA " + String(cnt_STAdisconnects));
      break;
#if defined(ESP8266)
    case WIFI_EVENT_SOFTAPMODE_STACONNECTED:
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     case ARDUINO_EVENT_WIFI_AP_STACONNECTED:
#else // остальные ESP32
    case ARDUINO_EVENT_WIFI_AP_STACONNECTED:
    // case SYSTEM_EVENT_AP_STACONNECTED:
#endif
      // WiFi.setAutoReconnect(false);
      // ScanRepeatFlag = false;
      WiFiFlags.flag.EVENT_AP_Connected = true;
      ts.enable(WIFI_HANDL);
      // SerialPrint("D", "WIFI Event", "Connected to AP");
      break;
// #if defined(ESP8266)
//     case WIFI_EVENT_SOFTAPMODE_STADISCONNECTED:
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     case ARDUINO_EVENT_WIFI_AP_STADISCONNECTED:
// #else // остальные ESP32
//     case ARDUINO_EVENT_WIFI_AP_STADISCONNECTED:
//     // case SYSTEM_EVENT_AP_STADISCONNECTED:
// #endif
//       // SerialPrint("D", "WIFI Event", "Disconnected to AP");
//       break;
// #if defined(ESP8266)
// // #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
// //     case ARDUINO_EVENT_WIFI_SCAN_DONE:
// //       cbScanComplete(WiFi.scanComplete());
// //       // SerialPrint("D", "WIFI Event", "Scan Done");
// //       break;
// #else // остальные ESP32
//     case ARDUINO_EVENT_WIFI_SCAN_DONE:
//     // case SYSTEM_EVENT_SCAN_DONE:
//       cbScanComplete(WiFi.scanComplete());
//       // SerialPrint("D", "WIFI Event", "Scan Done");
//       break;
// #endif
    // case ARDUINO_EVENT_WIFI_AP_START:
    //   SerialPrint("I", "WIFI Event", "Start AP ");
    //   break;
    // case ARDUINO_EVENT_WIFI_AP_STOP:
    //   SerialPrint("I", "WIFI Event", "Stop AP");
    //   break;
#if defined(ESP8266)
    default:
      // SerialPrint("D", "WIFI Event", "Unknown event: " + String(event));
      break;
// #elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
//     default:
//       // SerialPrint("D", "WIFI Event", "Unknown event: " + String(event->event_id));
//       break;
#else // остальные ESP32
    default:
      // SerialPrint("D", "WIFI Event", "Unknown event: " + String(event->event_id));
      break;
#endif
  }
}

void SysWiFi_StartScan() {
  int num = WiFi.scanComplete();
  // SerialPrint("D", "2 WiFi.status() ", String(WiFi.status()));
  // SerialPrint("D", "2 WIFI", "defSSID " + WiFi.SSID() + "@" + WiFi.psk());
  SerialPrint("D", "WIFI", "scanComplete() " + String(sysWiFi_ScanChannel) + " " + String(num));
  if (num >= 0) {
    cbScanComplete( num );
    if (WiFiFlags.flag.ScanToWeb)
      send_settin_ssidli_to_ws();
    if ((WiFiFlags.flag.ScanToWeb || WiFiFlags.flag.ScanRepeat) && sysWiFi_ScanChannel >= 13) {
      // send_settin_ssidli_to_ws();
      sysWiFi_ScanChannel = 0;
      if (WiFiFlags.flag.ScanToWeb)
        WiFiFlags.flag.ScanToWeb = false;
    }
  }
  if ((num == -2) || (num > 0)) {
    SerialPrint("I", "WIFI", "Start WiFi scan");
#if defined(ESP8266)
    WiFi.scanNetworksAsync( cbScanComplete , true );
#elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
    WiFi.scanNetworks( true, true );
#else // остальные ESP32
    WiFi.scanNetworks( true, true, false, SCAN_Period/40, ++sysWiFi_ScanChannel );
    // if ( sysWiFi_ScanChannel > 13 )
    // {
    //   sysWiFi_ScanChannel = 1;
    // }
#endif
  }
  // SerialPrint("D", "SysWiFi_StartScan", "WiFiFlags.flag.ScanRepeat = " + String(WiFiFlags.flag.ScanRepeat? "true" : "false"));
  // SerialPrint("D", "SysWiFi_StartScan", "last_time_Scan = " + String(last_time_Scan));
}

void SysWiFi_preinit( bool _enable) // вызвать в самом начале setup() для быстрого подключения к WiFi
{
  sysWiFi_isEnabled = _enable;
  // String def_ssid = "";
  // String def_pass = "";
  if (_enable) {
#if !defined(LIBRETINY)
    WiFiUtils_WiFiSetAutoConnect(true);
    WiFiUtils_WiFiSetAutoReconnect(true);
    WiFi.begin();
#endif
  } else {
    WiFiUtils_WiFiSetAutoConnect(false);
    WiFiUtils_WiFiSetAutoReconnect(false);
    WiFi.mode(WIFI_OFF);
  }
  
#if defined(ESP8266)
    // def_ssid = WiFi.SSID();
    // def_pass = WiFi.psk();
    // if (def_ssid != "" && def_pass != "") {
    // }
// #elif defined(esp32c3m_4mb)
#elif defined(LIBRETINY) // не проверялось
  WiFi.begin(def_ssid.c_str(), def_pass.c_str());
#elif defined(esp32c6_4mb) || defined(esp32c6_8mb) // не проверялось
#else // остальные ESP32
      WiFiUtils_WiFiSetAutoConnect(true);
      WiFiUtils_WiFiSetAutoReconnect(true);
      WiFi.begin();
#endif
//   if (def_ssid != "" && def_pass != "") {
// #if defined(LIBRETINY)
// #else
//     WiFi.begin();
// #endif
//   }
// #endif
  // if (WiFi.getMode() & WIFI_STA) // если уже коннектимся
  //   SerialPrint("I", "WIFI", "Fast connection");

    WiFiFlags.flag.EVENT_WIFI_CONF_NOT_READY = true;
}

void SysWiFi_init()
{
  if (sysWiFi_isEnabled) {
    #if defined(ESP32)
    #endif

    // Создаем задачу обслуживания WiFi
    ts.add(
      WIFI_HANDL, 20, [&](void *) {
        // ******************************************************************************************
        // Инициализация сетевых сервисов: при подключении к WiFi и получении IP или при подключении клиента к AP
        // ******************************************************************************************
        if(!s_WiFi_config.isNetServicesInitet && (WiFiFlags.flag.EVENT_STA_Got_IP || WiFiFlags.flag.EVENT_AP_Connected || isNetworkActive())) {
          if (WiFiFlags.flag.EVENT_AP_Connected) {
            // sysWiFi_StopPeriodicalScan(-2);
            WiFiFlags.flag.EVENT_AP_Connected = false;
          }
          SerialPrint("I", "WIFI", "InitNetServices");
          InitNetServices();
          s_WiFi_config.isNetServicesInitet = true;
        }
        // ******************************************************************************************
        // Деинициализация сетевых сервисов при смене режима на WIFI_OFF
        // ******************************************************************************************
        if(s_WiFi_config.isNetServicesInitet && WiFi.getMode() == WIFI_OFF) {
          s_WiFi_config.isNetServicesInitet = false;
          SerialPrint("I", "WIFI", "DeinitNetServices");
          DeinitNetServices();
          s_WiFi_config._scanList.clear();
        }

        // SerialPrint("D", "WIFI", "WiFiFlags.rawValue = " + String(WiFiFlags.rawValue));
        // проверяем флаги и сбрасываем их
        if (WiFiFlags.rawValue)
        {
          // ******************************************************************************************
          // произошло событие EVENT_WIFI_CONF_NOT_READY
          // ******************************************************************************************
          if (WiFiFlags.flag.EVENT_WIFI_CONF_NOT_READY)
          {
            String def_ssid = "";
            String def_pass = "";
#if defined(ESP8266)
            def_ssid = WiFi.SSID();
            def_pass = WiFi.psk();
            SysWiFi_start( def_ssid, def_pass );
#elif defined(LIBRETINY) || defined(esp32c6_4mb) || defined(esp32c6_8mb)
#else // остальные ESP32
            wifi_config_t default_conf;  
            esp_err_t err = esp_wifi_get_config(WIFI_IF_STA, &default_conf);  
            if (err == ESP_OK) {  
              def_ssid = String(reinterpret_cast<char*>(default_conf.sta.ssid));
              def_pass = String(reinterpret_cast<char*>(default_conf.sta.password));
              SerialPrint("D", "esp_wifi_get_config", def_ssid + "@" + def_pass);
              WiFiFlags.flag.EVENT_WIFI_CONF_NOT_READY = false;
              SysWiFi_start( def_ssid, def_pass );
            } else {
                SerialPrint("D", "err", String(err));
            }
#endif
          }
          // ******************************************************************************************
          // произошло событие EVENT_STA_Disconnect
          // ******************************************************************************************
          if (WiFiFlags.flag.EVENT_STA_Disconnect)
          {
            WiFiFlags.flag.EVENT_STA_Disconnect = false;
            cnt_STAdisconnects++;
            if (!WiFiFlags.flag.EVENT_STA_Connected && !WiFiFlags.flag.EVENT_STA_Got_IP) {
              SerialPrint("I", "WIFI", WiFi.SSID() + ": Disconnect " + String(cnt_STAdisconnects));
              // SerialPrint("D", "WIFI", "cnt_STAdisconnects " + String(cnt_STAdisconnects));
              // SerialPrint("D", "WIFI", "WiFi.getMode " + String(WiFi.getMode()));
    // SerialPrint("D", "1 WiFi.status() ", String(WiFi.status()));
    // SerialPrint("D", "1 WIFI", "defSSID " + WiFi.SSID() + "@" + WiFi.psk());
              if (cnt_STAdisconnects >= max_STAdisconnects) {
                if (s_WiFi_config._indexCurrentSSID < s_WiFi_config._scanIgnoreList.size())
                  s_WiFi_config._scanIgnoreList[s_WiFi_config._indexCurrentSSID] = max_SCANignore; // TODO WiFi выбрать определенные причины дисконнекта
                //   SerialPrint("D", "WIFI", "WiFi.persistent(true)");
                //   // WiFiUtils_WiFiSetAutoReconnect(true);
                //   WiFiUtils_WiFiSetPersistent(true);
                //   SysWiFi_manage_AP_STA(0);
                //   WiFiUtils_WiFiSetPersistent(false);
                // } else {
                  // WiFiUtils_WiFiSetAutoReconnect(false);
                SysWiFi_manage_AP_STA(-2); // отключаем STA, запускаем сканирование
                sysWiFi_StartPeriodicalScan(true);
                // }
              }
            }
          }
          // ******************************************************************************************
          // произошло событие EVENT_STA_Connected
          // ******************************************************************************************
          if (WiFiFlags.flag.EVENT_STA_Connected)
          {
            cnt_STAdisconnects = 0;
            WiFiFlags.flag.EVENT_STA_Connected = false;
            SerialPrint("I", "WIFI", WiFi.SSID() + ": Connected");
            // SerialPrint("D", "WIFI Event", "Connected to AP: " + WiFi.SSID());
          }
          // ******************************************************************************************
          // произошло событие EVENT_STA_Got_IP
          // ******************************************************************************************
          if (WiFiFlags.flag.EVENT_STA_Got_IP)
          {
            WiFiFlags.flag.EVENT_STA_Got_IP = false;
            // SerialPrint("D", "WIFI Event", "Got IP");
  #ifdef LIBRETINY
            SerialPrint("I", "WIFI", WiFi.SSID() + ": Got IP http://" + ipToString(WiFi.localIP()));
            jsonWriteStr(settingsFlashJson, "ip", ipToString(WiFi.localIP()));
  #else
            SerialPrint("I", "WIFI", WiFi.SSID() + ": Got IP http://" + WiFi.localIP().toString());
            jsonWriteStr(settingsFlashJson, "ip", WiFi.localIP().toString());
  #endif
            createItemFromNet("onWifi", "1", 1);
          }
          // ******************************************************************************************
          // периодический запуск сканирования сетей
          // ******************************************************************************************
          if (WiFiFlags.flag.ScanRepeat && ((millis() - last_time_Scan) >= SCAN_Period/16))
          {
            last_time_Scan = millis();
            SysWiFi_StartScan();
          } 
          // ******************************************************************************************
          // разовый запуск сканирования сетей для WEB
          // ******************************************************************************************
          // if (s_WiFi_config.ScanToWeb && ((millis() - last_time_Scan) >= SCAN_Period/16))
          if (WiFiFlags.flag.ScanToWeb && ((millis() - last_time_Scan) >= SCAN_Period/16))
          {
            last_time_Scan = millis();
            SysWiFi_StartScan();
          }
        }
        // if (s_WiFi_config.ScanToWeb)
        // {          
        // }
        if (!WiFiFlags.rawValue) {
          ts.disable(WIFI_HANDL);
          // SerialPrint("D", "WIFI", "ts.disable(WIFI_HANDL)");
          // SerialPrint("D", "WIFI", "mode " + String(WiFi.getMode()));
        }
      }, nullptr, true);
      // ts.disable(WIFI_HANDL); // запускаем по необходимости

    WiFi.onEvent(WiFiEvent);
    // WiFi.onEvent(cbScanComplete, ARDUINO_EVENT_WIFI_SCAN_DONE);

    // для каждого типа ESP нужно найти надежный механизм для автоматического подключения к WiFi #autoWiFi
    // 1. ESP8266 выдает сразу WiFi.SSID() и WiFi.psk(), другие ESP32 только после подключения
    // 2. ESP32c3 выдает WiFi.SSID() и WiFi.psk() только после подключения к роутеру
      // WiFiUtils_WiFiSetAutoConnect(false);
      // WiFiUtils_WiFiSetAutoReconnect(false);
      // WiFi.disconnect();
      // WiFi.mode(WIFI_OFF);
      // WiFi.setAutoReconnect(false);
      // WiFi.setAutoConnect(false);

    WiFiUtils_WiFiSetPersistent(false);
    WiFiUtils_WiFiSetPowerMax();
    // WiFiUtils_WiFiSetSleep(true); // TODO WiFi с этим WiFi работатет не устойчиво (пишут надо установить после got_ip)

    // SysWiFi_start();
    } else {
    ts.remove(WIFI_HANDL);
    WiFi.removeEvent(WiFiEvent);
    WiFi.disconnect();
    WiFi.mode(WIFI_OFF);
  }
}

void SysWiFi_start( String _ssid, String _pass )
{
  s_WiFi_config._ssidList.clear();
  s_WiFi_config._passwordList.clear();
  s_WiFi_config._scanList.clear();
  s_WiFi_config._scanIgnoreList.clear();
  jsonReadArray(settingsFlashJson, "routerssid", s_WiFi_config._ssidList);
  jsonReadArray(settingsFlashJson, "routerpass", s_WiFi_config._passwordList);

  // удаляем пустые пары элементов из _ssidList и _passwordList
  if (!s_WiFi_config._ssidList.empty()) {
    for (int i = s_WiFi_config._ssidList.size() - 1; i >= 0; i--)
      s_WiFi_config._scanIgnoreList.push_back(0);
    for (int i = s_WiFi_config._ssidList.size() - 1; i >= 0; i--) {
      if ((s_WiFi_config._ssidList[i] == "") || (s_WiFi_config._passwordList[i] == "")) {
          s_WiFi_config._ssidList.erase(s_WiFi_config._ssidList.begin() + i);
          s_WiFi_config._passwordList.erase(s_WiFi_config._passwordList.begin() + i);
          s_WiFi_config._scanIgnoreList.erase(s_WiFi_config._scanIgnoreList.begin() + i);
      }
    }
  }

  // String ssidListStr = "";
  // for (size_t i = 0; i < _ssidList.size(); i++) {
  //     ssidListStr += _ssidList[i];
  //     if (i < _ssidList.size() - 1) {
  //         ssidListStr += ", ";
  //     }
  // }
  // SerialPrint("I", "_ssidList", ssidListStr);

  s_WiFi_config._ssidAP = jsonReadStr(settingsFlashJson, "apssid");
  s_WiFi_config._passwordAP = jsonReadStr(settingsFlashJson, "appass");
  if (s_WiFi_config._ssidAP == "") {
    s_WiFi_config._ssidAP = WiFi.softAPSSID();
    if (s_WiFi_config._ssidAP == "") {
      s_WiFi_config._ssidAP = chipId;
    }
  }
  if (s_WiFi_config._passwordAP == "") // не надо создавать AP без авторизации по соображениям безопасности
    s_WiFi_config._passwordAP = default_passwordAP;




  if (isWiFi_MODE_CONFIG()) {
    SerialPrint("I", "WIFI", "WiFi_MODE_CONFIG");
    SysWiFi_manage_AP_STA(-2);
  } else {
    // SerialPrint("D", "WiFi.SSID()", WiFi.SSID());
    // SerialPrint("D", "WiFi.psk()", WiFi.psk());
    // if (WiFi.SSID() != s_WiFi_config._ssidList[0] || WiFi.psk() != s_WiFi_config._passwordList[0])
    if (_ssid != s_WiFi_config._ssidList[0] || _pass != s_WiFi_config._passwordList[0])
      SysWiFi_manage_AP_STA(-1); // будем сохранять в памяти ESP для быстрого подключения к WiFi при запуске
    else
      if (WiFi.getMode() & WIFI_STA) // если уже коннектимся
        SysWiFi_manage_AP_STA(-3); // обслужим только AP
      else
        SysWiFi_manage_AP_STA(0); // иначе пытаемся подключиться к WiFi[0]
  }
  if (isWiFi_MODE_SINGLE()) {
    SerialPrint("I", "WIFI", "WiFi_MODE_SINGLE");
  }
  if (isWiFi_MODE_MULTI()) {
    SerialPrint("I", "WIFI", "WiFi_MODE_MULTI");
  }
}
