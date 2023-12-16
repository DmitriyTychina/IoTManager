#include "utils/DevUtils.h"
// define см. в Const.h
#if defined(Dev_Utils) && Dev_Utils == 1

s_DevGlobal DevGlobal;
s_DevUnit DevLoopUnits[MaxDevLoopUnits];

#if defined(Dev_custom_yield) && Dev_custom_yield == 1
extern "C" void yield() {
    DevGlobal.cnt_yield++;
    int tmp_curr_unit = get_DevGlobal_curr_unit();
    if (tmp_curr_unit == esp_core_loop) {
        delay(0);
    }
    else {
        DevMeteringLoop(esp_core_loop, false);
        delay(0);
        DevMeteringLoop(tmp_curr_unit, false);
    }
}
#endif // Dev_custom_yield

const String arr_names_setup_unit[] = {
    "startSystem+serial",
    "fileSystemInit",
    "PrintInfo",
    "setChipId",
    "globalVarsSync",
    "i2cInit",
    "configure",
    "loadScenario",
    "create_onInit",
    "elementsLoop",
    "routerConnect",
#ifdef ASYNC_WEB_SERVER
    "asyncWebServerInit",
#endif
#ifdef ASYNC_WEB_SOCKETS
    "asyncWebSocketsInit",
#endif
#ifdef STANDARD_WEB_SERVER
    "standWebServerInit",
#endif
#ifdef STANDARD_WEB_SOCKETS
    "standWebSocketsInit",
#endif
    "ntpInit",
    "periodicTasksInit",
    "addThisDeviceToList",
    "udpListningInit",
    "udpBroadcastInit",
    "create_onStart",
    "stInit",
    "ts_add_TIMES",
    "core DevMetering"
};

const String arr_names_loop_unit[] = {
    "core TickerScheduler",
#if defined(DevMTS) && DevMTS == 1
    "*task_WIFI_SCAN[30s]",
    "*task_CONN_CHECK[20s]",
    "*task_TIME[1s]",
    "*task_UDP[60s]",
    "*task_TIMES[1]",
    "*task_PTASK[60s]",
    "*task_ST[3600s]",
#endif // DevMTS
    "HTTP_handleClient_loop",
    "standWebSocket_loop",
    "mqtt_loop",
    "IoTItems_loop",
    "core ESP",
    "core DevMetering"
};

void DevMeteringSetName(s_DevUnit* _arr_DevUnits, uint8_t _unit, String _name) {
    _arr_DevUnits[_unit].name = _name;
};

void DevMeteringSetNames(s_DevUnit* const& _arr_DevUnits, const String* const& _arr_names, uint8_t _arr_size) {
    for (uint8_t i = 0; i < _arr_size; i++) {
        DevMeteringSetName(_arr_DevUnits, i, _arr_names[i]);
    }
};

void Dev_PreInit(s_DevUnit* _arr_DevUnits, uint32_t _FreeHeap) {
    SerialPrint(F("Dev"), "PreInit", "FreeRAM " + String(_FreeHeap));
    SerialPrint(F("Dev"), "PreInit", "UsedRAM " + String(81920 - _FreeHeap));
    SerialPrint(F("Dev"), "PreInit", "SketchSize " + String(ESP.getSketchSize()));
    SerialPrint(F("Dev"), "PreInit", "CpuFreqMHz " + String(ESP.getCpuFreqMHz()));
    SerialPrint(F("Dev"), "PreInit", "FlashChipSpeedMHz " + String(ESP.getFlashChipSpeed() / 1000000));
    // SerialPrint(F("Dev"), "PreInit", "deepSleepMax " + String(ESP.deepSleepMax()));
    // SerialPrint(F("Dev"), "PreInit", "MaxFreeBlockSize " + String(ESP.getMaxFreeBlockSize()));
    // SerialPrint(F("Dev"), "PreInit", "HeapFragmentation " + String(ESP.getHeapFragmentation()));
    // SerialPrint(F("Dev"), "PreInit", "FreeContStack " + String(ESP.getFreeContStack()));
    SerialPrint(F("Dev"), "PreInit", "SdkVersion " + String(ESP.getSdkVersion()));
    SerialPrint(F("Dev"), "PreInit", "CoreVersion " + ESP.getCoreVersion());
    // SerialPrint(F("Dev"), "PreInit", "FullVersion " + ESP.getFullVersion());
    // SerialPrint(F("Dev"), "PreInit", "BootVersion " + String(ESP.getBootVersion()));
    // SerialPrint(F("Dev"), "PreInit", "BootMode " + String(ESP.getBootMode()));
    // SerialPrint(F("Dev"), "PreInit", "FlashChipId " + String(ESP.getFlashChipId()));
    // SerialPrint(F("Dev"), "PreInit", "FlashChipVendorId " + String(ESP.getFlashChipVendorId()));
    SerialPrint(F("Dev"), "PreInit", "FlashChipRealSize " + String(ESP.getFlashChipRealSize()));
    SerialPrint(F("Dev"), "PreInit", "FlashChipSize " + String(ESP.getFlashChipSize()));
    SerialPrint(F("Dev"), "PreInit", "FlashChipMode " + String(ESP.getFlashChipMode()));
    // SerialPrint(F("Dev"), "PreInit", "FlashChipSizeByChipId " + String(ESP.getFlashChipSizeByChipId()));
    SerialPrint(F("Dev"), "PreInit", "FreeSketchSpace " + String(ESP.getFreeSketchSpace()));
    SerialPrint(F("Dev"), "PreInit", "ResetReason " + ESP.getResetReason());
    SerialPrint(F("Dev"), "PreInit", "ResetInfo " + ESP.getResetInfo());

    DevMeteringSetNames(_arr_DevUnits, arr_names_setup_unit, MaxDevSetupUnits);
    DevGlobal.curr_unit = elm_startInit;
#if defined(DevMFLRAM) && DevMFLRAM == 1
    DevGlobal.s_RAM = _FreeHeap;
#endif // DevMFLRAM

};

void Dev_PostInit(s_DevUnit* _arr_DevUnits) {
    uint32_t stop_us = micros();
    SerialPrint(F("Dev"), "PostInit", "sizeRAM: " + String(ESP.getFreeHeap()));

    for (auto i = 0; i < MaxDevSetupUnits; i++) {
        DevMeteringPrintUnit(i, _arr_DevUnits, stop_us);
    }

    DevMeteringLoopInit();
    DevMeteringLoop(esp_core_loop, true);
};

void DevMeteringInitLoopUnits(int _unit) {
    DevLoopUnits[_unit].summ_us = 0;
    DevLoopUnits[_unit].cnt = 0;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    DevLoopUnits[_unit].min_us = DevMFLPeroid;
    DevLoopUnits[_unit].max_us = 0;
#endif // DevMFLMinMax
};

void DevMeteringLoopInit(uint32_t _FreeHeap) {
    if (!DevGlobal.metering_start_us) { // первый старт
#if defined(DevMFLRAM) && DevMFLRAM == 1
        DevMeteringSetNames(DevLoopUnits, arr_names_loop_unit, MaxDevLoopUnits);
        DevGlobal.RAM = ESP.getFreeHeap();
        DevGlobal.g_RAM = DevGlobal.RAM;
#endif // DevMFLRAM
        DevGlobal.marker_loop_us = micros();
    }
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    DevGlobal.min_loop_us = DevMFLPeroid;
    DevGlobal.max_loop_us = 0;
#endif // DevMFLMinMax
#if defined(DevMFLRAM) && DevMFLRAM == 1
    DevGlobal.RAM = _FreeHeap;
#endif // DevMFLRAM
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
    DevGlobal.cnt_loop = 0;
#endif // DevMFLCntAvg
};

void DevMetering(int _unit, s_DevUnit* _arr_DevUnits, int _core_metering, bool _main) {
    uint32_t curr_us = micros();
    if (DevGlobal.curr_unit != -1) { // не первый запуск
        uint32_t delta_us = curr_us - DevGlobal.start_curr_unit_us; // время работы предыдущего юнита
        _arr_DevUnits[DevGlobal.curr_unit].summ_us += delta_us;
        if (_main) {
            _arr_DevUnits[_unit].cnt++;
        }
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        if (!DevGlobal.pre_main) {
            delta_us += _arr_DevUnits[DevGlobal.curr_unit].pre_loop_us;
        }
        _arr_DevUnits[DevGlobal.curr_unit].pre_loop_us = delta_us;
        if (delta_us < _arr_DevUnits[DevGlobal.curr_unit].min_us) _arr_DevUnits[DevGlobal.curr_unit].min_us = delta_us;
        if (delta_us > _arr_DevUnits[DevGlobal.curr_unit].max_us) _arr_DevUnits[DevGlobal.curr_unit].max_us = delta_us;
        if (delta_us > _arr_DevUnits[DevGlobal.curr_unit].g_max_us) _arr_DevUnits[DevGlobal.curr_unit].g_max_us = delta_us;
#endif // DevMFLMinMax
    }
    DevGlobal.curr_unit = _unit;
    DevGlobal.pre_main = _main;
    _arr_DevUnits[_core_metering].summ_us += micros() - curr_us; // время работы core_metering_loop
    DevGlobal.start_curr_unit_us = micros(); // в конце чтобы не учитывать время работы этой функции
};

void DevMeteringLoop(int _unit, bool _main) {
    DevMetering(_unit, DevLoopUnits, core_metering_loop, _main);
}

void DevMeteringPrintUnit(int _unit, s_DevUnit* _arr_DevUnits, uint32_t _period) {
    String tmp_str = "***";
    tmp_str += "(" + _arr_DevUnits[_unit].name + ")";
    uint tmp_cnt = 32 - tmp_str.length();
    for (size_t i = 0; i < tmp_cnt; i++) tmp_str += " ";
    tmp_str += "cnt(" + String(_arr_DevUnits[_unit].cnt) + ")";
    tmp_str += "\tload(" + String((float)_arr_DevUnits[_unit].summ_us * 100 / _period) + "%)";
    // tmp_str += "\tsumm(" + String(_arr_DevUnits[_unit].summ_us) + " us)";
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    // tmp_str += "\tmin:p(" + String(_arr_DevUnits[_unit].min_us) + " us)";
    tmp_str += "\tmax:p(" + String(_arr_DevUnits[_unit].max_us) + " us)";
    tmp_str += "g(" + String(_arr_DevUnits[_unit].g_max_us) + " us)";
#endif // DevMFLMinMax
    SerialPrint(F("Dev"), F("Metering"), tmp_str);
    DevMeteringInitLoopUnits(_unit);
};

void DevMeteringPrintPeriod() {
    uint32_t stop_us = micros();
    uint32_t delta_period = stop_us - DevGlobal.marker_loop_us;
    DevGlobal.marker_loop_us = stop_us;
    uint32_t g_delta_period = stop_us - DevGlobal.metering_start_us;
    uint32_t summ_loop_us = 0;
    // uint32_t pm_summ_loop_us = 0;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    if (delta_period < DevGlobal.min_loop_us) DevGlobal.min_loop_us = delta_period;
    if (delta_period > DevGlobal.max_loop_us) {
        DevGlobal.max_loop_us = delta_period;
    }
    if (delta_period > DevGlobal.g_max_loop_us) DevGlobal.g_max_loop_us = delta_period;
#endif // DevMFLMinMax
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
    DevGlobal.cnt_loop++;
#endif // DevMFLCntAvg
    if (g_delta_period >= DevMFLPeroid) {
        DevGlobal.metering_start_us = stop_us;
        String tmp_str;
        // SerialPrint(F("Dev"), F("MaxDevSetupUnits"), String(MaxDevSetupUnits));
        // SerialPrint(F("Dev"), F("MaxDevLoopUnits"), String(MaxDevLoopUnits));
        SerialPrint(F("Dev"), F("Metering"), F("****************"));
        tmp_str = "***Period(" + String(DevMFLPeroid) + ")";
        tmp_str += "\trealPeriod(" + String(g_delta_period) + ")";
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
        tmp_str = "***cnt_loop:p(" + String(DevGlobal.cnt_loop) + ")";
#if defined(Dev_custom_yield) && Dev_custom_yield == 1
        tmp_str += "\tcnt_yield:p(" + String(DevGlobal.cnt_yield) + ")";
        DevGlobal.cnt_yield = 0;         // счетчик вызовов yield()
#endif // Dev_custom_yield
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
        uint32_t tmp_avg_loop = g_delta_period / DevGlobal.cnt_loop;
        tmp_str = "avg_loop:p(" + String(tmp_avg_loop) + " us)";
        if (tmp_avg_loop > DevGlobal.g_avg_loop) DevGlobal.g_avg_loop = tmp_avg_loop;
        tmp_str += "g(" + String(DevGlobal.g_avg_loop) + " us)";
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        tmp_str += "\tloop_min:p(" + String(DevGlobal.min_loop_us) + " us)";
        tmp_str += "\tloop_max:p(" + String(DevGlobal.max_loop_us) + " us)";
        tmp_str += "g(" + String(DevGlobal.g_max_loop_us) + " us)";
#endif // DevMFLMinMax
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#endif // DevMFLCntAvg
#if defined(DevMFLRAM) && DevMFLRAM == 1
        uint32_t FreeHeap = ESP.getFreeHeap();
        tmp_str = "***FreeRAM(" + String(FreeHeap) + ")";
        tmp_str += "\ttookRAM:p(" + String((int32)FreeHeap - (int32)DevGlobal.RAM) + ")";
        tmp_str += "g(" + String((int32)FreeHeap - (int32)DevGlobal.g_RAM) + ")";
        tmp_str += "s(" + String((int32)FreeHeap - (int32)DevGlobal.s_RAM) + ")";
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#endif // DevMFLRAM

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

                // SerialPrint(F("Dev"), F("Metering"), F("****************"));
        for (auto i = 0; i < MaxDevLoopUnits - 1; i++) {
            summ_loop_us += DevLoopUnits[i].summ_us;
            DevMeteringPrintUnit(i, DevLoopUnits, g_delta_period);
        }
        DevLoopUnits[core_metering_loop].summ_us = g_delta_period - summ_loop_us; // считаем что все остальное забрал core_metering_loop
        DevMeteringPrintUnit(core_metering_loop, DevLoopUnits, g_delta_period);
        DevMeteringLoopInit(FreeHeap);
        DevGlobal.start_curr_unit_us = DevGlobal.metering_start_us;

    }
};

#if defined(Dev_GetSize) && Dev_GetSize == 1
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem) {
    if (myIoTItem)
        SerialPrint(F("Dev"), "Subtype:ID_IoTItem:sizeRAM ", myIoTItem->getSubtype() + ":" + myIoTItem->getID() + ":" + String(myIoTItem->getSize()));
};
#endif // defined(Dev_GetSize) && Dev_GetSize == 1

int get_DevGlobal_curr_unit() {
    return DevGlobal.curr_unit;
};

#endif // #if defined(Dev_Utils) && Dev_Utils == 1
