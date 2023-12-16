#include "Main.h"
#include <time.h>
#include "classes/IoTDB.h"
#include "utils/Statistic.h"
#include <Wire.h>
#if defined(esp32s2_4mb) || defined(esp32s3_16mb)
#include <USB.h>
#endif

IoTScenario iotScen;  // объект управления сценарием

String volStrForSave = "";
// unsigned long currentMillis; // это сдесь лишнее
// unsigned long prevMillis;

void elementsLoop() {
    // передаем управление каждому элементу конфигурации для выполнения своих функций
    for (std::list<IoTItem *>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
        (*it)->loop();

        // if ((*it)->iAmDead) {
        if (!((*it)->iAmLocal) && (*it)->getIntFromNet() == -1) {
            delete *it;
            IoTItems.erase(it);
            break;
        }
    }

    handleOrder();
    handleEvent();
}

// #define SETUPBASE_ERRORMARKER 0
// #define SETUPCONF_ERRORMARKER 1
// #define SETUPSCEN_ERRORMARKER 2
// #define SETUPINET_ERRORMARKER 3
// #define SETUPLAST_ERRORMARKER 4
// #define TICKER_ERRORMARKER 5
// #define HTTP_ERRORMARKER 6
// #define SOCKETS_ERRORMARKER 7
// #define MQTT_ERRORMARKER 8
// #define MODULES_ERRORMARKER 9

// #define COUNTER_ERRORMARKER 4       // количество шагов счетчика
// #define STEPPER_ERRORMARKER 100000  // размер шага счетчика интервала доверия выполнения блока кода мкс

// #if defined(esp32_4mb) || defined(esp32_16mb) || defined(esp32cam_4mb)

// static int IRAM_ATTR initErrorMarkerId = 0;  // ИД маркера
// static int IRAM_ATTR errorMarkerId = 0;
// static int IRAM_ATTR errorMarkerCounter = 0;

// hw_timer_t *My_timer = NULL;
// void IRAM_ATTR onTimer() {
//     if (errorMarkerCounter >= 0) {
//         if (errorMarkerCounter >= COUNTER_ERRORMARKER) {
//             errorMarkerId = initErrorMarkerId;
//             errorMarkerCounter = -1;
//         } else
//             errorMarkerCounter++;
//     }
// }
// #endif

// void initErrorMarker(int id) {
// #if defined(esp32_4mb) || defined(esp32_16mb) || defined(esp32cam_4mb)
//     initErrorMarkerId = id;
//     errorMarkerCounter = 0;
// #endif
// }

// void stopErrorMarker(int id) {
// #if defined(esp32_4mb) || defined(esp32_16mb) || defined(esp32cam_4mb)
//     errorMarkerCounter = -1;
//     if (errorMarkerId)
//         SerialPrint("I", "WARNING!", "A lazy (freezing loop more than " + (String)(COUNTER_ERRORMARKER * STEPPER_ERRORMARKER / 1000) + " ms) section has been found! With ID=" + (String)errorMarkerId);
//     errorMarkerId = 0;
//     initErrorMarkerId = 0;
// #endif
// }

void setup() {
    uint32_t FreeHeapStart = ESP.getFreeHeap();
#if defined(esp32s2_4mb) || defined(esp32s3_16mb)
    USB.begin();
#endif
// #if defined(esp32_4mb) || defined(esp32_16mb) || defined(esp32cam_4mb)
//     My_timer = timerBegin(0, 80, true);
//     timerAttachInterrupt(My_timer, &onTimer, true);
//     timerAlarmWrite(My_timer, STEPPER_ERRORMARKER, true);
//     timerAlarmEnable(My_timer);
//     // timerAlarmDisable(My_timer);
//     initErrorMarker(SETUPBASE_ERRORMARKER);
// #endif

    Serial.begin(115200);
    Serial.flush();
    Serial.println();
    Serial.println(F("--------------started----------------"));

#if defined(Dev_Utils) && Dev_Utils == 1
    s_DevUnit DevSetupUnits[MaxDevSetupUnits];
    Dev_PreInit(DevSetupUnits, FreeHeapStart);
#endif //Dev_Utils
    // создание экземпляров классов
    // myNotAsyncActions = new NotAsync(do_LAST);

    // инициализация файловой системы
    DevMetering(elm_fileSystemInit, DevSetupUnits, core_metering_setup, true);
    fileSystemInit();
    DevMetering(elm_PrintInfo, DevSetupUnits, core_metering_setup, true);
    Serial.println(F("------------------------"));
    Serial.println("FIRMWARE NAME     " + String(FIRMWARE_NAME));
    Serial.println("FIRMWARE VERSION  " + String(FIRMWARE_VERSION));
    Serial.println("WEB VERSION       " + getWebVersion());
    const String buildTime = String(BUILD_DAY) + "." + String(BUILD_MONTH) + "." + String(BUILD_YEAR) + " " + String(BUILD_HOUR) + ":" + String(BUILD_MIN) + ":" + String(BUILD_SEC);
    Serial.println("BUILD TIME        " + buildTime);
    jsonWriteStr_(errorsHeapJson, F("bt"), buildTime);
    Serial.println(F("------------------------"));

    // получение chip id
    DevMetering(elm_setChipId, DevSetupUnits, core_metering_setup, true);
    setChipId();

    // синхронизация глобальных переменных с flash
    DevMetering(elm_globalVarsSync, DevSetupUnits, core_metering_setup, true);
    globalVarsSync();

    // stopErrorMarker(SETUPBASE_ERRORMARKER);

    // initErrorMarker(SETUPCONF_ERRORMARKER);

    // настраиваем i2c шину
    DevMetering(elm_i2cInit, DevSetupUnits, core_metering_setup, true);
    int i2c, pinSCL, pinSDA, i2cFreq;
    jsonRead(settingsFlashJson, "pinSCL", pinSCL, false);
    jsonRead(settingsFlashJson, "pinSDA", pinSDA, false);
    jsonRead(settingsFlashJson, "i2cFreq", i2cFreq, false);
    jsonRead(settingsFlashJson, "i2c", i2c, false);
    if (i2c != 0) {
#ifdef ESP32
        Wire.end();
        Wire.begin(pinSDA, pinSCL, (uint32_t)i2cFreq);
#else
        Wire.begin(pinSDA, pinSCL);
        Wire.setClock(i2cFreq);
#endif
        SerialPrint("i", "i2c", F("i2c pins overriding done"));
    }

    // настраиваем микроконтроллер
    DevMetering(elm_configure, DevSetupUnits, core_metering_setup, true);
    configure("/config.json");

    // stopErrorMarker(SETUPCONF_ERRORMARKER);

    // initErrorMarker(SETUPSCEN_ERRORMARKER);

    // подготавливаем сценарии
    DevMetering(elm_loadScenario, DevSetupUnits, core_metering_setup, true);
    iotScen.loadScenario("/scenario.txt");
    // создаем событие завершения инициализации основных моментов для возможности выполнения блока кода при загрузке
    DevMetering(elm_create_onInit, DevSetupUnits, core_metering_setup, true);
    createItemFromNet("onInit", "1", 1);

    DevMetering(elm_elementsLoop, DevSetupUnits, core_metering_setup, true);
    elementsLoop();

    // stopErrorMarker(SETUPSCEN_ERRORMARKER);

    // initErrorMarker(SETUPINET_ERRORMARKER);

    // подключаемся к роутеру
    DevMetering(elm_routerConnect, DevSetupUnits, core_metering_setup, true);
    routerConnect();

// инициализация асинхронного веб сервера и веб сокетов
#ifdef ASYNC_WEB_SERVER
    DevMetering(elm_asyncWebServerInit, DevSetupUnits, core_metering_setup, true);
    asyncWebServerInit();
#endif
#ifdef ASYNC_WEB_SOCKETS
    DevMetering(elm_asyncWebSocketsInit, DevSetupUnits, core_metering_setup, true);
    asyncWebSocketsInit();
#endif

// инициализация стандартного веб сервера и веб сокетов
#ifdef STANDARD_WEB_SERVER
    DevMetering(elm_standWebServerInit, DevSetupUnits, core_metering_setup, true);
    standWebServerInit();
#endif
#ifdef STANDARD_WEB_SOCKETS
    DevMetering(elm_standWebSocketsInit, DevSetupUnits, core_metering_setup, true);
    standWebSocketsInit();
#endif

    // stopErrorMarker(SETUPINET_ERRORMARKER);

    // initErrorMarker(SETUPLAST_ERRORMARKER);

    // NTP
    DevMetering(elm_ntpInit, DevSetupUnits, core_metering_setup, true);
    ntpInit();

    // инициализация задач переодического выполнения
    DevMetering(elm_periodicTasksInit, DevSetupUnits, core_metering_setup, true);
    periodicTasksInit();

    // запуск работы udp
    DevMetering(elm_addThisDeviceToList, DevSetupUnits, core_metering_setup, true);
    addThisDeviceToList();

    DevMetering(elm_udpListningInit, DevSetupUnits, core_metering_setup, true);
    udpListningInit();

    DevMetering(elm_udpBroadcastInit, DevSetupUnits, core_metering_setup, true);
    udpBroadcastInit();

    // создаем событие завершения конфигурирования для возможности выполнения блока кода при загрузке
    DevMetering(elm_create_onStart, DevSetupUnits, core_metering_setup, true);
    createItemFromNet("onStart", "1", 1);

    DevMetering(elm_stInit, DevSetupUnits, core_metering_setup, true);
    stInit();

    // настраиваем секундные обслуживания системы
    DevMetering(elm_ts_add_TIMES, DevSetupUnits, core_metering_setup, true);
    ts.add(TIMES, 1000, [&](void *) {
            DevMeteringLoop(task_TIMES, true);
            // сохраняем значения IoTItems в файл каждую секунду, если были изменения (установлены маркеры на сохранение)
            if (needSaveValues) {
                syncValuesFlashJson();
                needSaveValues = false;
            }

            // проверяем все элементы на тухлость
            for (std::list<IoTItem *>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
                (*it)->checkIntFromNet();

                // Serial.printf("[ITEM] size: %d, id: %s, int: %d, intnet: %d\n", sizeof(**it), (*it)->getID(), (*it)->getInterval(), (*it)->getIntFromNet());
            }
            DevMeteringLoop(ts_core_loop, true);
        },
        nullptr, true);

    
    // // test
    // Serial.println("-------test start--------");
    // Serial.println("--------test end---------");

    // stopErrorMarker(SETUPLAST_ERRORMARKER);
    DevMetering(core_metering_setup, DevSetupUnits, core_metering_setup, true);
    Dev_PostInit(DevSetupUnits);
}

void loop() {
// #ifdef LOOP_DEBUG
//     unsigned long st = millis();
// #endif

    // initErrorMarker(TICKER_ERRORMARKER);
    DevMeteringLoop(ts_core_loop, true);
    ts.update();
    // stopErrorMarker(TICKER_ERRORMARKER);

#ifdef STANDARD_WEB_SERVER
    // initErrorMarker(HTTP_ERRORMARKER);
    DevMeteringLoop(HTTP_handleClient_loop, true);
    HTTP.handleClient();
    // stopErrorMarker(HTTP_ERRORMARKER);
#endif

#ifdef STANDARD_WEB_SOCKETS
    // initErrorMarker(SOCKETS_ERRORMARKER);
    DevMeteringLoop(standWebSocket_loop, true);
    standWebSocket.loop();
    // stopErrorMarker(SOCKETS_ERRORMARKER);
#endif

    // initErrorMarker(MQTT_ERRORMARKER);
    DevMeteringLoop(mqtt_loop, true);
    mqttLoop();
    // stopErrorMarker(MQTT_ERRORMARKER);

    // initErrorMarker(MODULES_ERRORMARKER);
    DevMeteringLoop(elements_loop, true);
    elementsLoop();
    // stopErrorMarker(MODULES_ERRORMARKER);

    // #ifdef LOOP_DEBUG
    //     loopPeriod = millis() - st;
    //     if (loopPeriod > 2) Serial.println(loopPeriod);
    // #endif
    DevMeteringLoop(core_metering_loop, true);
    DevMeteringPrintPeriod();
    DevMeteringLoop(esp_core_loop, true);
}

// отправка json
// #ifdef QUEUE_FROM_STR
//     if (sendJsonFiles) sendJsonFiles->loop();
// #endif

// if(millis()%2000==0){
//     //watch->settimeUnix(time(&iotTimeNow));
//     Serial.println(watch->gettime("d-m-Y, H:i:s, M"));
//     delay(1);
// }

// File dir = FileFS.open("/", "r");
// String out;
// printDirectory(dir, out);
// Serial.println(out);

//=======проверка очереди из структур=================

// myDB = new IoTDB;
// QueueItems myItem;
// myItem.myword = "word1";
// myDB->push(myItem);
// myItem.myword = "word2";
// myDB->push(myItem);
// myItem.myword = "word3";
// myDB->push(myItem);
// Serial.println(myDB->front().myword);
// Serial.println(myDB->front().myword);
// Serial.println(myDB->front().myword);

// Serial.println(FileList("lg"));
