#pragma once
#include "Global.h"
#include "classes/IoTItem.h"
// define см. в Const.h

enum e_DevSetupUnits : uint8_t {
    elm_startInit = 0,
    elm_fileSystemInit,
    elm_PrintInfo,
    elm_setChipId,
    elm_globalVarsSync,
    elm_i2cInit,
    elm_configure,
    elm_loadScenario,
    elm_create_onInit,
    elm_elementsLoop,
    elm_routerConnect,
#ifdef ASYNC_WEB_SERVER
    elm_asyncWebServerInit,
#endif
#ifdef ASYNC_WEB_SOCKETS
    elm_asyncWebSocketsInit,
#endif
#ifdef STANDARD_WEB_SERVER
    elm_standWebServerInit,
#endif
#ifdef STANDARD_WEB_SOCKETS
    elm_standWebSocketsInit,
#endif
    elm_ntpInit,
    elm_periodicTasksInit,
    elm_addThisDeviceToList,
    elm_udpListningInit,
    elm_udpBroadcastInit,
    elm_create_onStart,
    elm_stInit,
    elm_ts_add_TIMES,
    core_metering_setup,    // всегда должна быть и быть предпоследней - время работы самого ядра DevMetering
    MaxDevSetupUnits        // всегда должна быть последней
};

enum e_DevLoopUnits : uint8_t {
    ts_core_loop = 0,
#if defined(DevMTS) && DevMTS == 1
    task_WIFI_SCAN,
    task_WIFI_MQTT_CONN_CHECK,
    task_TIME,
    task_UDP,
    task_TIMES,
    task_PTASK,
    task_ST,
#endif // DevMTS
    HTTP_handleClient_loop,
    standWebSocket_loop,
    mqtt_loop,
    elements_loop,
    esp_core_loop,  // всегда должна быть - время работы ядра ESP от конца loop() до начала loop()
    core_metering_loop,  // всегда должна быть и быть предпоследней - время работы самого ядра DevMetering
    MaxDevLoopUnits // всегда должна быть последней
};

struct s_DevUnit {
    String name = "noname";
    uint32_t summ_us = 0;
    uint32_t cnt = 0;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    uint32_t max_us = 0;                // максимальное значение времени потраченное на один юнит , мкс
    uint32_t min_us = DevMFLPeroid;     // минимальное значение времени потраченное на один юнит, мкс
    uint32_t g_max_us = 0;              // (g) за всё время
    uint32_t pre_loop_us = 0;           // предыдущее за один loop
#endif // DevMFLMinMax
};

struct s_DevGlobal {
#if defined(Dev_custom_yield) && Dev_custom_yield == 1
    uint32_t cnt_yield = 0;         // счетчик вызовов yield()
#endif // Dev_custom_yield
    int curr_unit = -1; // текущий юнит
    uint32_t start_curr_unit_us = 0; // время запуска текущего юнита
    uint32_t metering_start_us = 0;
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
    uint32_t cnt_loop = 0;          // счетчик циклов loop за период усреднения
    uint32_t g_avg_loop = 0;        // максимальная средняя длительность loop(us/period) за всё время
    bool pre_main = true;           // если false цикл loop не окончен и к pre_loop_us прибавляем потраченное время
#endif // DevMFLCntAvg
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    uint32_t marker_loop_us = 0;
    uint32_t min_loop_us = DevMFLPeroid;        // минимальная длительность loop за период
    uint32_t max_loop_us = 0;                   // максимальная длительность loop за период
    uint32_t g_max_loop_us = 0;                 // максимальная длительность loop за все время
#endif // DevMFLMinMax
#if defined(DevMFLRAM) && DevMFLRAM == 1
    uint32_t RAM = 0;
    uint32_t s_RAM = 0;
    uint32_t g_RAM = 0;
#endif // DevMFLRAM
};

#if defined(Dev_Utils) && Dev_Utils == 1
// вызываем в самом начале setup(), но после инициализации serial
void Dev_PreInit(s_DevUnit* _arr_DevUnits, uint32_t _FreeHeap);
// вызываем в самом конце setup()
void Dev_PostInit(s_DevUnit* _arr_DevUnits);

// void DevMeteringSetName(s_DevUnit* _arr_DevUnits, uint8_t _unit, String _name);        // задать имя юнита
// void DevMeteringSetNames(s_DevUnit* _arr_DevUnits, const String* const& _arr_names);
void DevMeteringLoopInit(uint32_t _FreeHeap = ESP.getFreeHeap());
void DevMetering(int _unit, s_DevUnit* _arr_DevUnits, int _core_metering, bool _main);     // считается время от одного DevMeteringLoop до следуещего DevMeteringLoop
void DevMeteringLoop(int _unit, bool _main);     // считается время от одного DevMeteringLoop до следуещего DevMeteringLoop
void DevMeteringPrintUnit(int _unit, s_DevUnit* _arr_DevUnits, uint32_t _period);
void DevMeteringPrintPeriod(); // поместить в конец Loop() вывод инфы с периодом DevMFLPeroid
int get_DevGlobal_curr_unit();

#else // заглушки для ver4stable
#define Dev_PreInit(arg)
#define Dev_PostInit(arg)
// #define DevMeteringSetName(arg1, arg2)
// #define DevMeteringLoopInit(arg)
#define DevMeteringLoop(arg1, arg2)
#define DevMeteringPrintPeriod()
#endif // Dev_Utils

#if defined(Dev_Utils) && Dev_Utils == 1 && defined(Dev_GetSize) && Dev_GetSize == 1
// размер RAM зинимаемый экземпляром IoTItem и стараемся его уменьшить особенно если таких экземпляров обычно у пользователя несколько
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem);
#else // заглушки для ver4stable
#define DevPrint_ID_sizeRAM(arg)
#endif // Dev_GetSize

// #if defined(Dev_Utils) && Dev_Utils == 1 && defined(Dev_XXX) && Dev_XXX == 1
// void DevPrint_ID_sizeRAM(IoTItem* myIoTItem);
// #else
// #define DevPrint_XXX(data)
// #endif // Dev_XXX
