#include "utils/DevUtils.h"
// define см. в Const.h
#if defined(Dev_Utils) && Dev_Utils == 1

#if defined(Dev_custom_yield) && Dev_custom_yield == 1
extern "C" void yield() {
    e_DevUnits tmp = get_DevGlobal_curr_unit();
    if (tmp == esp_core_loop) {
        delay(0);
    }
    else {
        DevMeteringLoop(esp_core_loop, false);
        delay(0);
        DevMeteringLoop(tmp, false);
    }
}
#endif // Dev_custom_yield

s_DevGlobal DevGlobal;
s_DevUnit DevUnits[MaxDevUnits];

void Dev_PreInit() {
    // SerialPrint(F("Dev"), "CpuFreqMHz ", ESP.getCpuFreqMHz());
};

void Dev_PostInit() {
    // SerialPrint(F("Dev"), "ID:sizeRAM", ESP.getFreeHeap());
};

void DevMeteringSetName(e_DevUnits _unit, String _name) {
    DevUnits[_unit].name = _name;
};

void DevMeteringInit(uint32_t _FreeHeap) {
    if (!DevGlobal.metering_start_us) { // первый старт
        DevMeteringSetName(ts_core_loop, "core TickerScheduler");
#if defined(DevMTS) && DevMTS == 1
        DevMeteringSetName(task_WIFI_SCAN, "task_WIFI_SCAN["+String(30)+"s]");
        DevMeteringSetName(task_WIFI_MQTT_CONN_CHECK, "task_CONN_CHECK["+String(MQTT_RECONNECT_INTERVAL/1000)+"s]");
        DevMeteringSetName(task_TIME, "task_TIME["+String(1)+"s]");
        DevMeteringSetName(task_UDP, "task_UDP["+String(60)+"s]");
        DevMeteringSetName(task_TIMES, "task_TIMES["+String(1)+"s]");
        DevMeteringSetName(task_PTASK, "task_PTASK["+String(60)+"s]");
        DevMeteringSetName(task_ST, "task_ST["+String(TELEMETRY_UPDATE_INTERVAL_MIN*60)+"s]");
#endif // DevMTS
        DevMeteringSetName(HTTP_handleClient_loop, "HTTP_handleClient_loop");
        DevMeteringSetName(standWebSocket_loop, "standWebSocket_loop");
        DevMeteringSetName(mqtt_loop, "mqtt_loop");
        DevMeteringSetName(elements_loop, "IoTItems_loop");
        DevMeteringSetName(esp_core_loop, "core ESP");
        DevMeteringSetName(core_metering, "core DevMetering");
        DevGlobal.g_RAM = _FreeHeap;
        DevGlobal.marker_loop_us = micros();
    }
    DevGlobal.metering_start_us = micros();
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    DevGlobal.min_loop_us = DevMFLPeroid;
    DevGlobal.max_loop_us = 0;
#endif // DevMFLMinMax
#if defined(DevMFLRAM) && DevMFLRAM == 1
    // DevGlobal.RAM = ESP.getFreeHeap();
    DevGlobal.RAM = _FreeHeap;
#endif // DevMFLRAM
    for (size_t i = 0; i < MaxDevUnits; i++) {
        DevUnits[i].summ_us = 0;
        DevUnits[i].cnt = 0;
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
        DevGlobal.cnt_loop = 0;
#endif // DevMFLCntAvg
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        DevUnits[i].max_us = 0;
        DevUnits[i].min_us = DevMFLPeroid;
#endif // DevMFLMinMax
    }
};

void DevMeteringLoop(e_DevUnits _unit, bool add) {
    uint32_t curr_us = micros();
    if (DevGlobal.curr_unit != MaxDevUnits) { // не первый запуск
        uint32_t delta_us = curr_us - DevGlobal.start_curr_unit_us; // время работы предыдущего юнита
        DevUnits[DevGlobal.curr_unit].summ_us += delta_us;
        if (add) DevUnits[_unit].cnt++;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        if (delta_us < DevUnits[DevGlobal.curr_unit].min_us) DevUnits[DevGlobal.curr_unit].min_us = delta_us;
        if (delta_us > DevUnits[DevGlobal.curr_unit].max_us) DevUnits[DevGlobal.curr_unit].max_us = delta_us;
        if (delta_us > DevUnits[DevGlobal.curr_unit].g_max_us) DevUnits[DevGlobal.curr_unit].g_max_us = delta_us;
#endif // DevMFLMinMax
    }
    else { // первый запуск
#if defined(DevMFLRAM) && DevMFLRAM == 1
        DevGlobal.RAM = ESP.getFreeHeap();
        DevGlobal.g_RAM = ESP.getFreeHeap();
#endif // DevMFLRAM
    }
    DevGlobal.curr_unit = _unit;
    DevUnits[core_metering].summ_us += micros() - curr_us; // время работы core_metering
    DevGlobal.start_curr_unit_us = micros(); // в конце чтобы не учитывать время работы этой функции
};

// void DevMTS(e_DevUnits _unit) {
// };

void DevMeteringPrintUnit(s_DevUnit* _DevMeteringUnit, uint32_t _period) {
    String tmp_str = "***";
    tmp_str += "(" + _DevMeteringUnit->name + ")";
    uint cnt = 32 - tmp_str.length();
    for (size_t i = 0; i < cnt; i++) tmp_str += " ";
    tmp_str += "cnt(" + String(_DevMeteringUnit->cnt) + ")";
    tmp_str += "\tload(" + String((float)_DevMeteringUnit->summ_us * 100 / _period) + "%)";
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    tmp_str += "\tmin:p(" + String(_DevMeteringUnit->min_us) + " us)";
    tmp_str += "\tmax:p(" + String(_DevMeteringUnit->max_us) + " us)";
    tmp_str += "g(" + String(_DevMeteringUnit->g_max_us) + " us)";
#endif // DevMFLMinMax
    // tmp_str += "\tsumm(" + String(_DevMeteringUnit->summ_us) + " us)";
    SerialPrint(F("Dev"), F("Metering"), tmp_str);
};

// void DevMeteringPrintNumUnit(e_DevUnits _unit) {

// }

void DevMeteringPrintPeriod() {
    uint32_t stop_us = micros();
    uint32_t delta_period = stop_us - DevGlobal.marker_loop_us;
    DevGlobal.marker_loop_us = stop_us;
    uint32_t g_delta_period = stop_us - DevGlobal.metering_start_us;
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
    DevGlobal.cnt_loop++;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    if (delta_period < DevGlobal.min_loop_us) DevGlobal.min_loop_us = delta_period;
    if (delta_period > DevGlobal.max_loop_us) DevGlobal.max_loop_us = delta_period;
    if (delta_period > DevGlobal.g_max_loop_us) DevGlobal.g_max_loop_us = delta_period;
#endif // DevMFLMinMax
#endif // DevMFLCntAvg
    if (g_delta_period >= DevMFLPeroid) {
        uint32_t FreeHeap = ESP.getFreeHeap();
        String tmp_str;
        uint32_t summ_loop_us = 0;
        // SerialPrint(F("Dev"), F("MaxDevUnits"), String(MaxDevUnits));
        SerialPrint(F("Dev"), F("Metering"), F("****************"));
        tmp_str = "***Period(" + String(DevMFLPeroid) + ")";
        tmp_str += "\trealPeriod(" + String(g_delta_period) + ")";
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
        tmp_str = "***cnt_loop(" + String(DevGlobal.cnt_loop) + ")";
        uint32_t tmp_avg_loop = g_delta_period / DevGlobal.cnt_loop;
        tmp_str += "\tavg_loop:p(" + String(tmp_avg_loop) + " us)";
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        if (tmp_avg_loop > DevGlobal.g_avg_loop) DevGlobal.g_avg_loop = tmp_avg_loop;
        tmp_str += "g(" + String(DevGlobal.g_avg_loop) + " us)";
        tmp_str += "\tloop_min:p(" + String(DevGlobal.min_loop_us) + " us)";
        tmp_str += "\tloop_max:p(" + String(DevGlobal.max_loop_us) + " us)";
        tmp_str += "g(" + String(DevGlobal.g_max_loop_us) + " us)";
#endif // DevMFLMinMax
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#endif // DevMFLCntAvg
#if defined(DevMFLRAM) && DevMFLRAM == 1
        tmp_str = "***FreeRAM(" + String(FreeHeap) + ")";
        tmp_str += "\ttookRAM:p(" + String((int32)FreeHeap - (int32)DevGlobal.RAM) + ")";
        tmp_str += "g(" + String((int32)FreeHeap - (int32)DevGlobal.g_RAM) + ")";
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#endif // DevMFLRAM
        for (size_t i = 0; i < MaxDevUnits - 1; i++) {
            DevMeteringPrintUnit(&DevUnits[i], g_delta_period);
            summ_loop_us += DevUnits[i].summ_us;
        }
        
// extern String settingsFlashJson;
// extern String valuesFlashJson;
// extern String errorsHeapJson;
// devListHeapJson
//         String orderBuf = "";
// String eventBuf = "";
// String mysensorBuf = "";

// // wifi
// String ssidListHeapJson = "{}";

// String devListHeapJson;
// String thisDeviceJson;
        DevUnits[core_metering].summ_us = g_delta_period - summ_loop_us; // считаем что все остальное забрал core_metering
        // SerialPrint(F("Dev"), F("Metering"), F("****************"));
        DevMeteringPrintUnit(&DevUnits[core_metering], g_delta_period);
        DevMeteringInit(FreeHeap);
    }
    DevMeteringLoop(esp_core_loop, false);
}

#if defined(Dev_GetSize) && Dev_GetSize == 1
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem) {
    if (myIoTItem)
        SerialPrint(F("Dev"), "ID_IoTItem:sizeRAM ", myIoTItem->getID() + ":" + String(myIoTItem->getSize()));
};
#endif // defined(Dev_GetSize) && Dev_GetSize == 1

e_DevUnits get_DevGlobal_curr_unit() {
    return DevGlobal.curr_unit;
};

#endif // #if defined(Dev_Utils) && Dev_Utils == 1
