#include "utils/WiFiUtils.h"
#include <vector>
#define TRIESONE 25 // количество попыток подключения к одной сети из несколких
#define TRIES 40    // количество попыток подключения сети если она одна

void routerConnect()
{
  WiFi.setAutoConnect(false);
  WiFi.persistent(false);

  WiFi.mode(WIFI_STA);
  byte triesOne = TRIESONE;

  std::vector<String> _ssidList;
  std::vector<String> _passwordList;
  jsonReadArray(settingsFlashJson, "routerssid", _ssidList);
  jsonReadArray(settingsFlashJson, "routerpass", _passwordList);
  if (_ssidList.size() > 1)
    triesOne = TRIES;

  if (_passwordList.size() == 0 && _ssidList[0] == "" && _passwordList[0] == "")
  {
    WiFi.begin();
  }
  else
  {
    WiFi.begin(_ssidList[0].c_str(), _passwordList[0].c_str());
#ifdef ESP32
    WiFi.setTxPower(WIFI_POWER_19_5dBm);
#else
    WiFi.setOutputPower(20.5);
#endif
    String _ssid;
    String _password;
    for (int8_t i = 0; i < _ssidList.size(); i++)
    {
      _ssid = _ssid + _ssidList[i] + "; ";
    }
    for (int8_t i = 0; i < _passwordList.size(); i++)
    {
      _password = _password + _passwordList[i] + "; ";
    }
    SerialPrint("i", "WIFI", "ssid list: " + _ssid);
    SerialPrint("i", "WIFI", "pass list: " + _password);
  }
  for (size_t i = 0; i < _ssidList.size(); i++)
  {
    triesOne = TRIESONE;
    if (WiFi.status() == WL_CONNECTED)
      break;
    WiFi.begin(_ssidList[i].c_str(), _passwordList[i].c_str());
    SerialPrint("i", "WIFI", "ssid connect: " + _ssidList[i]);
    SerialPrint("i", "WIFI", "pass connect: " + _passwordList[i]);
    while (--triesOne && WiFi.status() != WL_CONNECTED)
    {
//            SerialPrint("i", "WIFI", ": " + String((int)WiFi.status()));
#ifdef ESP8266
      if (WiFi.status() == WL_CONNECT_FAILED || WiFi.status() == WL_WRONG_PASSWORD)
#else
      if (WiFi.status() == WL_CONNECT_FAILED)
#endif
      {
        SerialPrint("E", "WIFI", "password is not correct");
        triesOne = 1;
        jsonWriteInt(errorsHeapJson, "passer", 1);
        break;
      }
      Serial.print(".");
      delay(1000);
    }
    Serial.println("");
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("");
    startAPMode();
  }
  else
  {
    Serial.println("");
    SerialPrint("i", "WIFI", "http://" + WiFi.localIP().toString());
    jsonWriteStr(settingsFlashJson, "ip", WiFi.localIP().toString());

    mqttInit();
  }
  SerialPrint("i", F("WIFI"), F("Network Init"));
}

bool startAPMode()
{
  SerialPrint("i", "WIFI", "AP Mode");

  WiFi.disconnect();
  WiFi.mode(WIFI_AP);

  String _ssidAP = jsonReadStr(settingsFlashJson, "apssid");
  String _passwordAP = jsonReadStr(settingsFlashJson, "appass");

  WiFi.softAP(_ssidAP.c_str(), _passwordAP.c_str());
  IPAddress myIP = WiFi.softAPIP();

  SerialPrint("i", "WIFI", "AP IP: " + myIP.toString());
  jsonWriteStr(settingsFlashJson, "ip", myIP.toString());

  if (jsonReadInt(errorsHeapJson, "passer") != 1)
  {
    ts.add(WIFI_SCAN, 30 * 1000, [&](void *) {
          DevMeteringLoop(task_WIFI_SCAN, true);
          std::vector<String> jArray;
          jsonReadArray(settingsFlashJson, "routerssid", jArray);
          for (int8_t i = 0; i < jArray.size(); i++)
          {
            SerialPrint("i", "WIFI", "scanning for " + jArray[i]);
          }
          if (RouterFind(jArray))
          {
            ts.remove(WIFI_SCAN);
            WiFi.scanDelete();
            routerConnect();
          }
          DevMeteringLoop(ts_core_loop, false);
      },
        nullptr, true);
  }
  return true;
}

boolean RouterFind(std::vector<String> jArray)
{
  bool res = false;
  int n = WiFi.scanComplete();
  SerialPrint("i", "WIFI", "scan result: " + String(n, DEC));

  if (n == -2)
  { // Сканирование не было запущено, запускаем
    SerialPrint("i", "WIFI", "start scanning");
    WiFi.scanNetworks(true, false); // async, show_hidden
  }

  else if (n == -1)
  { // Сканирование все еще выполняется
    SerialPrint("i", "WIFI", "scanning in progress");
  }

  else if (n == 0)
  { // ни одна сеть не найдена
    SerialPrint("i", "WIFI", "no networks found");
    WiFi.scanNetworks(true, false);
  }
  else if (n > 0)
  {
    for (int8_t i = 0; i < n; i++)
    {
      for (int8_t k = 0; k < jArray.size(); k++)
      {
        if (WiFi.SSID(i) == jArray[k])
        {
          res = true;
        }
      }
      // SerialPrint("i", "WIFI", (res ? "*" : "") + String(i, DEC) + ") " + WiFi.SSID(i));
      jsonWriteStr_(ssidListHeapJson, String(i), WiFi.SSID(i));

      // String(WiFi.RSSI(i)
    }
  }
  SerialPrint("i", "WIFI", ssidListHeapJson);
  WiFi.scanDelete();
  return res;
}

boolean isNetworkActive() {
    return WiFi.status() == WL_CONNECTED;
}

uint8_t getNumAPClients() {
    return WiFi.softAPgetStationNum();
}

uint8_t RSSIquality() {
    uint8_t res = 0;
    if (isNetworkActive()) {
        int rssi = WiFi.RSSI();
        if (rssi >= -50) {
            res = 6;  //"Excellent";
        } else if (rssi < -50 && rssi >= -60) {
            res = 5;  //"Very good";
        } else if (rssi < -60 && rssi >= -70) {
            res = 4;  //"Good";
        } else if (rssi < -70 && rssi >= -80) {
            res = 3;  //"Low";
        } else if (rssi < -80 && rssi > -100) {
            res = 2;  //"Very low";
        } else if (rssi <= -100) {
            res = 1;  //"No signal";
        }
    }
    return res;
}
