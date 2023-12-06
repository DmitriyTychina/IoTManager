#pragma once
#include "Global.h"
#include "classes/IoTItem.h"
// define см. в Const.h

enum e_DevUnits {
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
    esp_core_loop, // всегда должна быть - время работы ядра ESP от конца loop() до начала loop()
    core_metering, // всегда должна быть и быть последней - время работы самого ядра DevMetering
    MaxDevUnits
};

struct s_DevUnit {
    String name = "noname";
    uint32_t summ_us = 0;
    uint32_t cnt = 0;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        uint32_t max_us = 0;                // максимальное значение времени потраченное на один юнит , мкс
        uint32_t min_us = DevMFLPeroid;     // минимальное значение времени потраченное на один юнит, мкс
        uint32_t g_max_us = 0;              // (g) за всё время
#endif // DevMFLMinMax
};

struct s_DevGlobal {
    e_DevUnits curr_unit = MaxDevUnits; // текущий юнит
    uint32_t start_curr_unit_us = micros(); // время запуска текущего юнита
    uint32_t metering_start_us = 0;
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
        uint32_t cnt_loop = 0;          // счетчик циклов loop за период усреднения
#endif // DevMFLCntAvg
#if defined(DevMFLRAM) && DevMFLRAM == 1
        uint32_t RAM = 0;
        uint32_t g_RAM = 0;
#endif // DevMFLRAM
};

#if defined(Dev_Utils) && Dev_Utils == 1
// вызываем в самом начале setup(), но после инициализации serial
void Dev_PreInit();
// вызываем в самом конце setup()
void Dev_PostInit();

void DevMeteringSetName(e_DevUnits _unit, String _name);  // задать имя
void DevMeteringInit(uint32_t _FreeHeap = ESP.getFreeHeap());    // поместить в Setup()
void DevMeteringLoop(e_DevUnits _unit, bool add = false);  // считается время от одного DevMeteringLoop до следуещего DevMeteringLoop
// void DevMTS(e_DevUnits _unit);
void DevMeteringPrintPeriod(); // поместить в конец Loop() вывод инфы с периодом DevMFLPeroid

#else // заглушки для ver4stable
#define Dev_PreInit()
#define Dev_PostInit()
#define DevMeteringSetName(arg1, arg2)
#define DevMeteringInit(arg)
#define DevMeteringLoop(arg1, arg2)
#define DevMTS()
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
