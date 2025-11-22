#include "WsServer.h"
#include "classes/IoTScenario.h"
extern IoTScenario iotScen;

int selectList_current_num = -1; // -1 первый старт

#ifdef STANDARD_WEB_SOCKETS
void standWebSocketsInit() {
    standWebSocket.begin();
    standWebSocket.onEvent(webSocketEvent);
    SerialPrint("i", "WS", "WS server initialized");
    for (size_t i = 0; i < WEBSOCKETS_CLIENT_MAX; i++)
    {
        ws_clients[i] = -1;
    }
    // при активной странице в браузере пинги идут примерно 1 раз в 2 сек
    // при отсутствии активности на странице (примерно через 2 мин) пинги идут примерно 1 раз в 60 сек
    // ловим пинги от WS и дисконнектим если их нет 2 раза 60сек*2прохода = 120сек
    ts.add(
        PiWS, 60000, [&](void*) {
            bool f_stopTS = true;
            // if (isNetworkActive()) { // не отключим их если пропало соединение с WiFi
            for (size_t i = 0; i < WEBSOCKETS_CLIENT_MAX; i++)
            {
                if (ws_clients[i] == 0) {
                    disconnectWSClient(i);
                    ws_clients[i] = -1;
                }
                if (ws_clients[i] > 0) { 
                    ws_clients[i] = 0;
                    f_stopTS = false;
                }
            }
            if (f_stopTS) // действия если нет активных клиентов
            {
                ts.disable(PiWS);
                s_WiFi_config._scanList.clear();
                // SerialPrint("D", "WS", "ts.disable(PiWS)");
            }
            // }
        },
        nullptr, false);
    ts.disable(PiWS); // запускаем по необходимости
}

void standWebSocketsDeinit() {
    standWebSocket.onEvent(NULL);
    ts.remove(PiWS);
    standWebSocket.close();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_ERROR: {
            SerialPrint("E", "WS " + String(num), "Error!");
            // Serial.printf("[%u] Error!\n", num);
        } break;

        case WStype_DISCONNECTED: {
            SerialPrint("D", "WS " + String(num), "WS client disconnected");
            // Serial.printf("[%u] Disconnected!\n", num);
            // if(standWebSocket.clientIsConnected(num))
            //     SerialPrint("i", "WS " + String(num), "WS client is connected");
            // else
            //     SerialPrint("i", "WS " + String(num), "WS client is disconnected");
            // standWebSocket.disconnect(num); // он уже отключен
        } break;

        case WStype_CONNECTED: {
            // IPAddress ip = standWebSocket.remoteIP(num);
            SerialPrint("i", "WS " + String(num), "WS client connected");
            if (num >= WEBSOCKETS_CLIENT_MAX) {
                SerialPrint("E", "WS", "Too many clients, connection closed!!!");
                jsonWriteInt(errorsHeapJson, "wse1", 1);
                // standWebSocket.close();
                standWebSocketsDeinit();
                standWebSocketsInit();
            }
            ts.enable(PiWS);
            // SerialPrint("D", "WS", "ts.enable(PiWS)");
            // Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0],
            // ip[1], ip[2], ip[3], payload); standWebSocket.sendTXT(num,
            // "Connected");
        } break;

        case WStype_TEXT: {
            bool endOfHeaderFound = false;
            size_t maxAllowedHeaderSize = 15;  // максимальное количество символов заголовка
            size_t headerLenth = 0;
            String headerStr;
            for (size_t i = 0; i <= maxAllowedHeaderSize; i++) {
                headerLenth++;
                char s = (char)payload[i];
                headerStr += s;
                if (s == '|') {
                    endOfHeaderFound = true;
                    break;
                }
            }
            if (!endOfHeaderFound) {
                SerialPrint("E", "WS " + String(num), "Package without header");
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса dashboard
            //----------------------------------------------------------------------//
            if (headerStr == "/pi|") {
                standWebSocket.sendTXT(num, "/po|");
                // Serial.printf("Ping client: %u\n", num);
                SerialPrint("D", "WS " + String(num), "Ping client");
                ws_clients[num]=1;
            }
            // публикация всех виджетов
            if (headerStr == "/|") {
                sendFileToWsByFrames("/layout.json", "layout", "", num, WEB_SOCKETS_FRAME_SIZE);
            }

            if (headerStr == "/params|") {
                // публикация всех статус сообщений при подключении svelte приложения
                String params = "{}";
                for (std::list<IoTItem*>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
                    if ((*it)->getSubtype() != "Loging") {
                        if ((*it)->getSubtype() != "LogingDaily") {
                            if ((*it)->iAmLocal) jsonWriteStr(params, (*it)->getID(), (*it)->getValue());
                        }
                    }
                }
                sendStringToWs("params", params, num);

                // генерация события подключения в модулях
                for (std::list<IoTItem*>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
                    if ((*it)->iAmLocal) (*it)->onMqttWsAppConnectEvent();
                }
            }

            // отвечаем на запрос графиков
            if (headerStr == "/charts|") {
                // обращение к логированию из ядра
                // отправка данных графиков только в выбранный сокет
                for (std::list<IoTItem*>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
                    // сбрасываем даты графиков
                    //  if ((*it)->getID().endsWith("-date")) {
                    //     (*it)->setTodayDate();
                    // }
                    if ((*it)->getSubtype() == "Loging" || "LogingDaily") {
                        (*it)->setPublishDestination(TO_WS, num);
                        (*it)->publishValue();
                    }
                }
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса configutation
            //----------------------------------------------------------------------//

            // отвечаем данными на запрос страницы
            if (headerStr == "/config|") {
                sendFileToWsByFrames("/items.json", "itemsj", "", num, WEB_SOCKETS_FRAME_SIZE);
                sendFileToWsByFrames("/widgets.json", "widget", "", num, WEB_SOCKETS_FRAME_SIZE);
                sendFileToWsByFrames("/config.json", "config", "", num, WEB_SOCKETS_FRAME_SIZE);
                sendFileToWsByFrames("/scenario.txt", "scenar", "", num, WEB_SOCKETS_FRAME_SIZE);
                send_settin_ssidli_to_ws(num);
            }

            // обработка кнопки сохранить
            if (headerStr == "/gifnoc|") {
                writeFileUint8tByFrames("config.json", payload, length, headerLenth, 256);
            }
            if (headerStr == "/tuoyal|") {
                writeFileUint8tByFrames("layout.json", payload, length, headerLenth, 256);
            }
            if (headerStr == "/oiranecs|") {
                writeFileUint8tByFrames("scenario.txt", payload, length, headerLenth, 256);
                clearConfigure();
                globalVarsSync();   // в том числе подгружаем сохраненные значения элементов с флешки
                configure("/config.json");
                iotScen.loadScenario("/scenario.txt");
                // создаем событие завершения конфигурирования для возможности
                // выполнения блока кода при загрузке
                createItemFromNet("onStart", "1", 1);
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса connection
            //----------------------------------------------------------------------//

            // отвечаем данными на запрос страницы
            if (headerStr == "/connection|") {
                sendFileToWsByFrames("/widgets.json", "widget", "", num, WEB_SOCKETS_FRAME_SIZE);
                sendFileToWsByFrames("/config.json", "config", "", num, WEB_SOCKETS_FRAME_SIZE);
                send_settin_ssidli_to_ws(num);
// #ifdef WIFI_ASYNC                
//                 ssidListHeapJson = "{}";
//                 jsonWriteStr_(ssidListHeapJson, "0", "Scanning...") ;
// #endif
                sendStringToWs("errors", errorsHeapJson, num);
                // запуск асинхронного сканирования wifi сетей при переходе на страницу
                sysWiFi_StartPeriodicalScan(false);
                // соединений RouterFind(jsonReadStr(settingsFlashJson,
                // F("routerssid")));
            }

            // обработка кнопки сохранить settings.json
            if (headerStr == "/sgnittes|") {
                writeUint8tToString(payload, length, headerLenth, settingsFlashJson);
                writeFileUint8tByFrames("settings.json", payload, length, headerLenth, 256);
                sendStringToWs("errors", errorsHeapJson, num);
                // если не было создано приема данных по udp - то создадим его
                addThisDeviceToList();
#ifdef WIFI_ASYNC                
                settingsFlashJson = readFile(F("settings.json"), 4096);
                settingsFlashJson.replace("\r\n", "");
                Serial.println(settingsFlashJson);
                SysWiFi_init();
#endif
            }

            // обработка кнопки сохранить настройки mqtt
            if (headerStr == "/mqtt|") {
                send_settin_ssidli_to_ws(num); // отправляем в ответ новые полученные настройки
                handleMqttStatus(false, 8);  // меняем статус на неопределенный
                mqttReconnect();             // начинаем переподключение
                sendStringToWs("errors", errorsHeapJson,
                               num);  // отправляем что статус неопределен
                // sendStringToWs("ssidli", ssidListHeapJson, num);
            }

            // запуск асинхронного сканирования wifi сетей при нажатии выпадающего списка
            if (headerStr == "/scan|") {
                sysWiFi_StartPeriodicalScan(false);
                String json; // TODO WiFi
                writeUint8tToString(payload, length, headerLenth, json); // TODO WiFi
                SerialPrint("D", "payload", json); // TODO WiFi

            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса list
            //----------------------------------------------------------------------//

            // отвечаем данными на запрос страницы list
            if (headerStr == "/list|") {
                send_settin_ssidli_to_ws(num);
                // отправим список устройств в зависимости от того что выбрал user
                // sendDeviceList(num);
            }

            // отвечаем на запрос списка устройств (это отдельный запрос который
            // делает приложение при подключении)
            if (headerStr == "/devlist|") {
                // отправим список устройств в зависимости от того что выбрал user
                sendDeviceList(num);
            }

            // сохраняем данные листа
            if (headerStr == "/tsil|") {
                writeFileUint8tByFrames("devlist.json", payload, length, headerLenth, 256);
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса system
            //----------------------------------------------------------------------//

            // отвечаем данными на запрос страницы
            if (headerStr == "/system|") {
                sendStringToWs("errors", errorsHeapJson, num);
                send_settin_ssidli_to_ws(num);
            }

            if (headerStr == "/localt|") {
                String timeStr = String((char*)payload + 8);
                //Serial.println("Время с фронта: /localt|" + timeStr);
            
                // Обрезаем дробную часть, если есть
                int dotIndex = timeStr.indexOf('.');
                if (dotIndex != -1) {
                    timeStr = timeStr.substring(0, dotIndex);
                }
            
                // Парсим UNIX-время в секундах
                time_t unixTime = (time_t)timeStr.toInt();
            
                // Создаём структуру timeval
                timeval tv;
                tv.tv_sec = unixTime;  // Секунды эпохи
                tv.tv_usec = 0;        // Микросекунды
            
                // Устанавливаем время
                if (settimeofday(&tv, NULL) == 0) {
                    //Serial.printf("Время установлено: %ld\n", unixTime);
                    #ifdef LIBRETINY
                    SerialPrint("i", F("Time"), "Время установлено из браузера: ");     
                    #else 
                    SerialPrint("i", F("Time"), "Время установлено из браузера: " + String(unixTime));  
                    #endif          
                } else {
                    #ifdef LIBRETINY
                    //Serial.printf("Ошибка установки времени: %ld\n", unixTime);
                    SerialPrint("i", F("=>WS"), "Ошибка установки времени: ");
                    #else
                    SerialPrint("i", F("=>WS"), "Ошибка установки времени: " + String(unixTime));
                    #endif
                }
                // timeval tv2{0, 0};
                // timezone tz = timezone{0, 0};
                // time_t epoch = 0;
                // if (gettimeofday(&tv2, &tz) != -1) {
                //     epoch = tv2.tv_sec;
                // }
                // unixTime = epoch;
                // SerialPrint("I", F("NTP"), "TIME " + String(unixTime));
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса dev
            //----------------------------------------------------------------------//
            if (headerStr == "/dev|") {
                sendStringToWs("errors", errorsHeapJson, num);
                send_settin_ssidli_to_ws(num);
                sendFileToWsByFrames("/config.json", "config", "", num, WEB_SOCKETS_FRAME_SIZE);
                sendFileToWsByFrames("/items.json", "itemsj", "", num, WEB_SOCKETS_FRAME_SIZE);
                // sendFileToWsByFrames("/layout.json", "layout", "", num,
                // WEB_SOCKETS_FRAME_SIZE);
            }

            //----------------------------------------------------------------------//
            // Страница веб интерфейса update
            //----------------------------------------------------------------------//
            if (headerStr == "/profile|") {
                // для версии 451 отдаем myProfile.json
                sendFileToWsByFrames("/ota.json", "otaupd", "", num, WEB_SOCKETS_FRAME_SIZE);
                if (FileFS.exists("/myProfile.json")) {
                    sendFileToWsByFrames("/myProfile.json", "prfile", "", num, WEB_SOCKETS_FRAME_SIZE);
                    // для версии 452 и более отдаем flashProfile.json
                } else if (FileFS.exists("/flashProfile.json")) {
                    sendFileToWsByFrames("/flashProfile.json", "prfile", "", num, WEB_SOCKETS_FRAME_SIZE);
                }
            }

            //----------------------------------------------------------------------//
            // отдельные команды веб интерфейса
            //----------------------------------------------------------------------//

            // переписать любое поле в errors json
            if (headerStr == "/rorre|") {
                writeUint8tValueToJsonString(payload, length, headerLenth, errorsHeapJson);
            }

            // команда перезагрузки esp
            if (headerStr == "/reboot|") {
                ESP.restart();
            }

            // команда очистки всех логов esp
            if (headerStr == "/clean|") {
                cleanLogs();
            }

            // команда обновления прошивки esp
            if (headerStr == "/update|") {
                String path;
                writeUint8tToString(payload, length, headerLenth, path);
                upgrade_firmware(3, path);
            }

            // Прием команд control c dashboard
            if (headerStr == "/control|") {
                String msg;
                writeUint8tToString(payload, length, headerLenth, msg);
                String key = selectFromMarkerToMarker(msg, "/", 0);
                String value = selectFromMarkerToMarker(msg, "/", 1);
                generateOrder(key, value);
                SerialPrint("i", F("=>WS"), "Msg from svelte web, WS No: " + String(num) + ", msg: " + msg);
            }

            if (headerStr == "/tst|") {
                standWebSocket.sendTXT(num, "/tstr|");
            }

            // получаем команду посланную из модуля
            if (headerStr == "/order|") {
                String json;
                writeUint8tToString(payload, length, headerLenth, json);

                String id, key, value;
                jsonRead(json, "id", id);
                jsonRead(json, "key", key);
                jsonRead(json, "value", value);

                SerialPrint("i", F("=>WS"), "Msg from module, id: " + id);

                for (std::list<IoTItem*>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
                    if ((*it)->getID() == id) {
                        (*it)->onModuleOrder(key, value);
                    }
                }
            }

        } break;

        case WStype_BIN: {
            Serial.printf("[%u] get binary length: %u\n", num, length);
            // hexdump(payload, length);
            // standWebSocket.sendBIN(num, payload, length);
        } break;

        case WStype_FRAGMENT_TEXT_START: {
            Serial.printf("[%u] fragment test start: %u\n", num, length);
        } break;

        case WStype_FRAGMENT_BIN_START: {
            Serial.printf("[%u] fragment bin start: %u\n", num, length);
        } break;

        case WStype_FRAGMENT: {
            Serial.printf("[%u] fragment: %u\n", num, length);
        } break;

        case WStype_FRAGMENT_FIN: {
            Serial.printf("[%u] fragment finish: %u\n", num, length);
        } break;

        case WStype_PING: {
            // Serial.printf("[%u] ping: %u\n", num, length);
            SerialPrint("D", "WS " + String(num), "Ping: " + String(length));
        } break;

        case WStype_PONG: {
            // Serial.printf("[%u] pong: %u\n", num, length);
            SerialPrint("D", "WS " + String(num), "Pong: " + String(length));
        } break;

        default: {
            Serial.printf("[%u] not recognized: %u\n", num, length);
        } break;
    }
}

// публикация статус сообщений в ws (недостаток в том что делаем бродкаст всем
// клиентам поднятым в свелте!!!)
void publishStatusWs(const String& topic, const String& data) {
    String path = mqttRootDevice + "/" + topic;
    String json = "{}";
    jsonWriteStr(json, "status", data);
    jsonWriteStr(json, "topic", path);
    sendStringToWs("status", json, -1);
}

// публикация дополнительных json сообщений в ws
void publishJsonWs(const String& topic, String& json) {
    String path = mqttRootDevice + "/" + topic;
    jsonWriteStr(json, "topic", path);
    // TO DO отправка полей в веб
    // sendStringToWs("status", json, -1);
}

// данные которые мы отправляем в сокеты переодически
void periodicWsSend() {
    SerialPrint("D", "WS", "isNetworkActive: " + String(isNetworkActive()));
    SerialPrint("D", "WS", "getNumAPClients: " + String(getNumAPClients()));
    SerialPrint("D", "WS", "getNumWSClients: " + String(getNumWSClients()));
    if (s_WiFi_config.isNetServicesInitet) {
        // sendStringToWs("ssidli", ssidListHeapJson, -1);
        send_settin_ssidli_to_ws(-1);
        sendStringToWs("errors", errorsHeapJson, -1);
        // отправляем переодичестки только в авто режиме
        if (jsonReadInt(settingsFlashJson, F("udps")) != 0) {
            sendStringToWs("devlis", devListHeapJson, -1);
        }
    }
}

#ifdef ESP32
void hexdump(const void* mem, uint32_t len, uint8_t cols = 16) {
    const uint8_t* src = (const uint8_t*)mem;
    Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
    for (uint32_t i = 0; i < len; i++) {
        if (i % cols == 0) {
            Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
        }
        Serial.printf("%02X ", *src);
        src++;
    }
    Serial.printf("\n");
}
#endif
#endif

void sendFileToWsByFrames(const String& filename, const String& header, const String& json, int client_id, size_t frameSize) {
    if (header.length() != 6) {
        SerialPrint("E", "FS", F("wrong header size"));
        return;
    }

    auto path = filepath(filename);
    auto file = FileFS.open(path, "r");
    //SerialPrint("I", "sendFileToWsByFrames", ("reed file: ")+ path);
    if (!file) {
        SerialPrint("E", "FS", F("reed file error"));
        return;
    }

    // size_t totalSize = file.size();
    // Serial.println("Send file '" + String(filename) + "', file size: " +
    // String(totalSize));

    char buf[32];
    sprintf(buf, "%04d", json.length() + 12);
    String data = header + "|" + String(buf) + "|" + json;

    size_t headerSize = data.length();
    auto frameBuf = new uint8_t[frameSize];
    size_t maxPayloadSize = frameSize - headerSize;
    uint8_t* payloadBuf = nullptr;

    int i = 0;
    while (file.available()) {
        if (i == 0) {
            data.toCharArray((char*)frameBuf, frameSize);
            payloadBuf = &frameBuf[headerSize];
        } else {
            maxPayloadSize = frameSize;
            headerSize = 0;
            payloadBuf = &frameBuf[0];
        }

        size_t payloadSize = file.read(payloadBuf, maxPayloadSize);
        if (payloadSize) {
            size_t size = headerSize + payloadSize;

            bool fin = false;
            if (size == frameSize) {
                fin = false;
            } else {
                fin = true;
            }

            bool continuation = false;
            if (i == 0) {
                continuation = false;
            } else {
                continuation = true;
            }

//             Serial.println(String(i) + ") " + "ws: " + String(client_id) + " fr sz: " 
//             + String(size) + " fin: " + String(fin) + " cnt: " +
//             String(continuation));
#ifdef ASYNC_WEB_SOCKETS
            if (client_id == -1) {
                //ws.broadcastBIN(frameBuf, size, fin, continuation);
                ws.binaryAll(frameBuf, size);
            } else {
                //ws.sendBIN(client_id, frameBuf, size, fin, continuation);
                ws.binary(client_id,frameBuf, size);
            }
#elif defined (STANDARD_WEB_SOCKETS)
            if (client_id == -1) {
                standWebSocket.broadcastBIN(frameBuf, size, fin, continuation);

            } else {
                standWebSocket.sendBIN(client_id, frameBuf, size, fin, continuation);
            }
#endif
        }
        i++;
    }
    payloadBuf = &frameBuf[0];
    delete[] payloadBuf;
    file.close();
}

void sendStringToWs(const String& header, String& payload, int client_id) {
#ifdef LIBRETINY    
    if (/* (!getNumAPClients() && !isNetworkActive())  || */ !getNumWSClients()) {
#else
    if ( (!getNumAPClients() && !isNetworkActive())  ||  !getNumWSClients()) {
#endif        
      //  SerialPrint("E", "sendStringToWs", "getNumAPClients: " + String(getNumAPClients()) + "isNetworkActive: " + String(isNetworkActive() + "getNumWSClients: " + String(getNumWSClients())));
        // standWebSocket.disconnect(); // это и ниже надо сделать при -
        // standWebSocket.close();      // - отключении AP И WiFi(STA), надо менять ядро WiFi. Сейчас не закрывается сессия клиента при пропаже AP И WiFi(STA)
        return;
    }

    if (header.length() != 6) {
        SerialPrint("E", "FS", F("wrong header size"));
        return;
    }

    String msg = header + "|0012|" + payload;
    size_t totalSize = msg.length();
   // SerialPrint("E", "sendStringToWs", msg);
    char dataArray[totalSize];
    msg.toCharArray(dataArray, totalSize + 1);
#ifdef ASYNC_WEB_SOCKETS
    if (client_id == -1) {
        ws.binaryAll((uint8_t*)dataArray, totalSize);
    } else {
        ws.binary(client_id, (uint8_t*)dataArray, totalSize);
    }
#elif defined (STANDARD_WEB_SOCKETS)
    if (client_id == -1) {
        standWebSocket.broadcastBIN((uint8_t*)dataArray, totalSize);
    } else {
        standWebSocket.sendBIN(client_id, (uint8_t*)dataArray, totalSize);
    }
#endif
}

void disconnectWSClient(uint8_t client_id)
{
    standWebSocket.disconnect(client_id);
    SerialPrint("i", "WS","Client disconnected: " + String(client_id));
}

void sendDeviceList(uint8_t num)
{
    if (jsonReadInt(settingsFlashJson, F("udps")) != 0) {
        // если включен автопоиск то отдаем список из оперативной памяти
        SerialPrint("i", "FS", "heap list");
        sendStringToWs("devlis", devListHeapJson, num);
    } else {
        // если выключен автопоиск то отдаем список из флешь памяти
        sendFileToWsByFrames("/devlist.json", "devlis", "", num, WEB_SOCKETS_FRAME_SIZE);
        SerialPrint("i", "FS", "flash list");
    }
}
#ifdef ASYNC_WEB_SOCKETS
int getNumWSClients() { return ws.count(); }
#elif defined (STANDARD_WEB_SOCKETS)
int getNumWSClients() { return standWebSocket.connectedClients(false); }
#endif

void send_settin_ssidli_to_ws(int num) {
    String json_settin = settingsFlashJson;
    ssidListHeapJson = "{}";
    String routerssid_for_ws = "";
    String routerpass_for_ws = "";
    int cnt = 0;
    bool ssidList_is_empty = s_WiFi_config._ssidList.empty();

    if (ssidList_is_empty && selectList_current_num == -1) {
        jsonWriteStr_(ssidListHeapJson, String(cnt++), ssidList_phrase_first);
        selectList_current_num = 0;
    }
    if (!ssidList_is_empty) {
        for (int8_t k = 0; k < s_WiFi_config._ssidList.size(); k++) {
            jsonWriteStr_(ssidListHeapJson, String(cnt++), "[" + String(k) + "]" + s_WiFi_config._ssidList[k]);
        }
    }
    if (!s_WiFi_config._scanList.empty()) {
        for (int8_t k = 0; k < s_WiFi_config._scanList.size(); k++) {
            jsonWriteStr_(ssidListHeapJson, String(cnt++), s_WiFi_config._scanList[k]);
        }
    }
    if (!ssidList_is_empty)
        jsonWriteStr_(ssidListHeapJson, String(cnt++), ssidList_phrase_last);

    if (ssidList_is_empty) {
        routerssid_for_ws = "[" + String(selectList_current_num) + "]" + jsonReadStr(ssidListHeapJson, String(selectList_current_num));
        routerpass_for_ws = "";
    } else {
        if (selectList_current_num == -1) {
            routerssid_for_ws = "[" + String(s_WiFi_config._indexCurrentSSID) + "]" + s_WiFi_config._ssidList[s_WiFi_config._indexCurrentSSID];
            routerpass_for_ws = s_WiFi_config._passwordList[s_WiFi_config._indexCurrentSSID];

        } else {
            if (selectList_current_num < s_WiFi_config._ssidList.size()) {
                routerssid_for_ws = "[" + String(selectList_current_num) + "]" + jsonReadStr(ssidListHeapJson, String(selectList_current_num));
                routerpass_for_ws = s_WiFi_config._passwordList[selectList_current_num];
            } else {
                routerssid_for_ws = jsonReadStr(ssidListHeapJson, String(selectList_current_num));
                routerpass_for_ws = "";
            }
        }
    }
    // selectList_current_num = 0;
    // SerialPrint("D", "routerssid_for_ws", routerssid_for_ws);
    // SerialPrint("D", "routerpass_for_ws", routerpass_for_ws);
    // SerialPrint("D", "_indexCurrentSSID", String(s_WiFi_config._indexCurrentSSID));
    // SerialPrint("D", "selectList_current_num", String(selectList_current_num));
    // SerialPrint("D", "_ssidList.size()", String(s_WiFi_config._ssidList.size()));

    jsonWriteStr_(json_settin, "routerssid", routerssid_for_ws);
    jsonWriteStr_(json_settin, "routerpass", routerpass_for_ws);
    sendStringToWs("settin", json_settin, num);
    sendStringToWs("ssidli", ssidListHeapJson, num);

    // SerialPrint("D", "json_settin", json_settin);
    // SerialPrint("D", "ssidListHeapJson", ssidListHeapJson);

}
