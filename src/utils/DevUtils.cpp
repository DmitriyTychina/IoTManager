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
    SerialPrint(F("Dev"), "PreInit", "FreeRAM " + String(ESP.getFreeHeap()));
    SerialPrint(F("Dev"), "PreInit", "UsedRAM " + String(81920 - ESP.getFreeHeap()));
    SerialPrint(F("Dev"), "PreInit", "SketchSize " + String(ESP.getSketchSize()));
    SerialPrint(F("Dev"), "PreInit", "CpuFreqMHz " + String(ESP.getCpuFreqMHz()));
    SerialPrint(F("Dev"), "PreInit", "FlashChipSpeedMHz " + String(ESP.getFlashChipSpeed()/1000000));
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
};

void Dev_PostInit() {
    SerialPrint(F("Dev"), "PostInit", "ID:sizeRAM" + String(ESP.getFreeHeap()));
};

void DevMeteringSetName(e_DevUnits _unit, String _name) {
    DevUnits[_unit].name = _name;
};
void DevMeteringInitUnit(e_DevUnits _unit) {
    DevUnits[_unit].summ_us = 0;
    DevUnits[_unit].cnt = 0;
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    DevUnits[_unit].min_us = DevMFLPeroid;
    DevUnits[_unit].max_us = 0;
#endif // DevMFLMinMax
}

void DevMeteringInit(uint32_t _FreeHeap) {
    if (!DevGlobal.metering_start_us) { // первый старт
        DevMeteringSetName(ts_core_loop, "core TickerScheduler");
#if defined(DevMTS) && DevMTS == 1
        DevMeteringSetName(task_WIFI_SCAN, "*task_WIFI_SCAN["+String(30)+"s]");
        DevMeteringSetName(task_WIFI_MQTT_CONN_CHECK, "*task_CONN_CHECK["+String(MQTT_RECONNECT_INTERVAL/1000)+"s]");
        DevMeteringSetName(task_TIME, "*task_TIME["+String(1)+"s]");
        DevMeteringSetName(task_UDP, "*task_UDP["+String(60)+"s]");
        DevMeteringSetName(task_TIMES, "*task_TIMES["+String(1)+"s]");
        DevMeteringSetName(task_PTASK, "*task_PTASK["+String(60)+"s]");
        DevMeteringSetName(task_ST, "*task_ST["+String(TELEMETRY_UPDATE_INTERVAL_MIN*60)+"s]");
#endif // DevMTS
        DevMeteringSetName(HTTP_handleClient_loop, "HTTP_handleClient_loop");
        DevMeteringSetName(standWebSocket_loop, "standWebSocket_loop");
        DevMeteringSetName(mqtt_loop, "mqtt_loop");
        DevMeteringSetName(elements_loop, "IoTItems_loop");
        DevMeteringSetName(esp_core_loop, "core ESP");
        DevMeteringSetName(core_metering, "core DevMetering");
#if defined(DevMFLRAM) && DevMFLRAM == 1
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

void DevMeteringLoop(e_DevUnits _unit, bool _main) {
    uint32_t curr_us = micros();
    if (DevGlobal.curr_unit != MaxDevUnits) { // не первый запуск
        uint32_t delta_us = curr_us - DevGlobal.start_curr_unit_us; // время работы предыдущего юнита
        DevUnits[DevGlobal.curr_unit].summ_us += delta_us;
        if (_main) {
            DevUnits[_unit].cnt++;
        }
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
        if (!DevGlobal.pre_cnt) {
            delta_us += DevUnits[DevGlobal.curr_unit].pre_loop_us;
        }
        DevUnits[DevGlobal.curr_unit].pre_loop_us = delta_us;
        if (delta_us < DevUnits[DevGlobal.curr_unit].min_us) DevUnits[DevGlobal.curr_unit].min_us = delta_us;
        if (delta_us > DevUnits[DevGlobal.curr_unit].max_us) DevUnits[DevGlobal.curr_unit].max_us = delta_us;
        if (delta_us > DevUnits[DevGlobal.curr_unit].g_max_us) DevUnits[DevGlobal.curr_unit].g_max_us = delta_us;
#endif // DevMFLMinMax
    }
    DevGlobal.curr_unit = _unit;
    DevGlobal.pre_cnt = _main;
    DevUnits[core_metering].summ_us += micros() - curr_us; // время работы core_metering
    DevGlobal.start_curr_unit_us = micros(); // в конце чтобы не учитывать время работы этой функции
};

void DevMeteringPrintUnit(e_DevUnits _unit, uint32_t _period) {
    String tmp_str = "***";
    tmp_str += "(" + DevUnits[_unit].name + ")";
    uint tmp_cnt = 32 - tmp_str.length();
    for (size_t i = 0; i < tmp_cnt; i++) tmp_str += " ";
    tmp_str +=  "cnt(" + String(DevUnits[_unit].cnt) + ")";
    tmp_str += "\tload(" + String((float)DevUnits[_unit].summ_us * 100 / _period) + "%)";
    // tmp_str += "\tsumm(" + String(DevUnits[_unit].summ_us) + " us)";
#if defined(DevMFLMinMax) && DevMFLMinMax == 1
    // tmp_str += "\tmin:p(" + String(DevUnits[_unit].min_us) + " us)";
    tmp_str += "\tmax:p(" + String(DevUnits[_unit].max_us) + " us)";
    tmp_str += "g(" + String(DevUnits[_unit].g_max_us) + " us)";
#endif // DevMFLMinMax
    SerialPrint(F("Dev"), F("Metering"), tmp_str);
    DevMeteringInitUnit(_unit);
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
        // SerialPrint(F("Dev"), F("MaxDevUnits"), String(MaxDevUnits));
        SerialPrint(F("Dev"), F("Metering"), F("****************"));
        tmp_str = "***Period(" + String(DevMFLPeroid) + ")";
        tmp_str += "\trealPeriod(" + String(g_delta_period) + ")";
        SerialPrint(F("Dev"), F("Metering"), tmp_str);
#if defined(DevMFLCntAvg) && DevMFLCntAvg == 1
        tmp_str = "***cnt_loop(" + String(DevGlobal.cnt_loop) + ")";
        uint32_t tmp_avg_loop = g_delta_period / DevGlobal.cnt_loop;
        tmp_str += "\tavg_loop:p(" + String(tmp_avg_loop) + " us)";
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
        for (auto i = 0; i < MaxDevUnits - 1; i++) {
            summ_loop_us += DevUnits[i].summ_us;
            DevMeteringPrintUnit((e_DevUnits)i, g_delta_period);
        }
        DevUnits[core_metering].summ_us = g_delta_period - summ_loop_us; // считаем что все остальное забрал core_metering
        DevMeteringPrintUnit(core_metering, g_delta_period);
        DevMeteringInit(FreeHeap);
        DevGlobal.start_curr_unit_us = DevGlobal.metering_start_us;

    }
}

#if defined(Dev_GetSize) && Dev_GetSize == 1
void DevPrint_ID_sizeRAM(IoTItem* myIoTItem) {
    if (myIoTItem)
        SerialPrint(F("Dev"), "Subtype:ID_IoTItem:sizeRAM ", myIoTItem->getSubtype() + ":" + myIoTItem->getID() + ":" + String(myIoTItem->getSize()));
};
#endif // defined(Dev_GetSize) && Dev_GetSize == 1

e_DevUnits get_DevGlobal_curr_unit() {
    return DevGlobal.curr_unit;
};

#endif // #if defined(Dev_Utils) && Dev_Utils == 1
