#include "Global.h"
#include "classes/IoTItem.h"
#include <map>
#include <HardwareSerial.h>

#include "ModbusEC.h"
#include "AdapterCommon.h"
// #include "Stream.h"
#include <vector>

// class ModbusUart;
Stream *_modbusUART = nullptr;

#define UART_LINE 2
uint8_t _DIR_PIN = 0;
// Modbus stuff
// Данные Modbus по умолчанию

#define MODBUS_RX_PIN 18        // Rx pin
#define MODBUS_TX_PIN 19        // Tx pin
#define MODBUS_SERIAL_BAUD 9600 // Baud rate for esp32 and max485 communication

void modbusPreTransmission()
{
    //  delay(500);
    if (_DIR_PIN)
        digitalWrite(_DIR_PIN, HIGH);
}

// Pin 4 made low for Modbus receive mode
// Контакт 4 установлен на низком уровне для режима приема Modbus
void modbusPostTransmission()
{
    if (_DIR_PIN)
        digitalWrite(_DIR_PIN, LOW);
    //  delay(500);
}

// ModbusMaster node;

// RsEctoControl *rsEC;

class EctoControlAdapter : public IoTItem
{
private:
    int _rx = MODBUS_RX_PIN; // адреса прочитаем с веба
    int _tx = MODBUS_TX_PIN;
    int _baud = MODBUS_SERIAL_BAUD;
    String _prot = "SERIAL_8N1";
    int protocol = SERIAL_8N1;
    uint8_t _addr = 0xF0; // Адрес слейва от 1 до 247
    uint8_t _type = 0x14; // Тип устройства: 0x14 – адаптер OpenTherm (вторая версия); 0x11 – адаптер OpenTherm (первая версия, снята с производства)
    uint8_t _debugLevel;  // Дебаг

    ModbusMaster node;
    uint8_t _debug;
    // Stream *_modbusUART;

    BoilerInfo info;
    BoilerStatus status;

    uint16_t code;
    uint16_t codeExt;
    uint8_t flagErr;
    float flow;
    float maxSetCH;
    float maxSetDHW;
    float minSetCH;
    float minSetDHW;
    float modLevel;
    float press;
    float tCH;
    float tDHW;
    float tOut;
    bool enableCH;
    bool enableDHW;
    bool enableCH2;
    bool _isNetworkActive;
    bool _mqttIsConnect;

public:
    EctoControlAdapter(String parameters) : IoTItem(parameters)
    {
        _DIR_PIN = 0;
        _addr = jsonReadInt(parameters, "addr"); // адреса slave прочитаем с веба
        _rx = jsonReadInt(parameters, "RX");     // прочитаем с веба
        _tx = jsonReadInt(parameters, "TX");
        _DIR_PIN = jsonReadInt(parameters, "DIR_PIN");
        _baud = jsonReadInt(parameters, "baud");
        _prot = jsonReadStr(parameters, "protocol");
        jsonRead(parameters, "debug", _debugLevel);

        if (_prot == "SERIAL_8N1")
        {
            protocol = SERIAL_8N1;
        }
        else if (_prot == "SERIAL_8N2")
        {
            protocol = SERIAL_8N2;
        }

        // Serial2.begin(baud-rate, protocol, RX pin, TX pin);

        _modbusUART = new HardwareSerial(UART_LINE);

        if (_debugLevel > 2)
        {
            SerialPrint("I", "EctoControlAdapter", "baud: " + String(_baud) + ", protocol: " + String(protocol, HEX) + ", RX: " + String(_rx) + ", TX: " + String(_tx));
        }
        ((HardwareSerial *)_modbusUART)->begin(_baud, protocol, _rx, _tx); // выбираем тип протокола, скорость и все пины с веба
        ((HardwareSerial *)_modbusUART)->setTimeout(200);
        //_modbusUART = &serial;
        node.begin(_addr, _modbusUART);

        node.preTransmission(modbusPreTransmission);
        node.postTransmission(modbusPostTransmission);

        if (_DIR_PIN)
        {
            _DIR_PIN = _DIR_PIN;
            pinMode(_DIR_PIN, OUTPUT);
            digitalWrite(_DIR_PIN, LOW);
        }

        // 0x14 – адаптер OpenTherm (вторая версия)
        // 0x15 – адаптер eBus
        // 0x16 – адаптер Navien
        if (_addr > 0)
        {
            uint16_t type;
            readFunctionModBus(0x0003, type);
            type = type >> 8;
            if (0x14 != type && 0x15 != type && 0x16 != type)
            {
                SerialPrint("E", "EctoControlAdapter", "Не подходящее устройство, type: " + String(type, HEX));
            }
            getModelVersion();
            getBoilerInfo();
            getBoilerStatus();
        }
        else if (_addr == 0)
        { // если адреса нет, то шлем широковещательный запрос адреса
            uint8_t addr = node.readAddresEctoControl();
            SerialPrint("I", "EctoControlAdapter", "readAddresEctoControl, addr: " + String(addr, HEX) + " - Enter to configuration");
        }
    }

    void doByInterval()
    {
        if (_addr > 0)
        {
            // readBoilerInfo();
            getBoilerStatus();

            getCodeError();
            getCodeErrorExt();
            if (info.adapterType == 0)
                getFlagErrorOT();
            // getFlowRate();
            // getMaxSetCH();
            // getMaxSetDHW();
            // getMinSetCH();
            // getMinSetDHW();
            getModLevel();
            getPressure();
            getTempCH();
            getTempDHW();
            getTempOutside();
        }
    }

    void loop()
    {
        // для новых версий IoTManager
        IoTItem::loop();
    }

    IoTValue execute(String command, std::vector<IoTValue> &param)
    {
        if (command == "getModelVersion")
        {
            getModelVersion();
        }
        if (command == "getBoilerInfo")
        {
            getBoilerInfo();
        }
        if (command == "getBoilerStatus")
        {
            getBoilerStatus();
        }
        if (command == "getCodeError")
        {
            getCodeError();
        }
        if (command == "getCodeErrorExt")
        {
            getCodeErrorExt();
        }
        if (command == "getFlagErrorOT")
        {
            getFlagErrorOT();
        }
        if (command == "getFlowRate")
        {
            getFlowRate();
        }
        if (command == "getMaxSetCH")
        {
            getMaxSetCH();
        }
        if (command == "getMaxSetDHW")
        {
            getMaxSetDHW();
        }
        if (command == "getMinSetCH")
        {
            getMinSetCH();
        }
        if (command == "getMinSetDHW")
        {
            getMinSetDHW();
        }
        if (command == "getModLevel")
        {
            getModLevel();
        }
        if (command == "getPressure")
        {
            getPressure();
        }
        if (command == "getTempCH")
        {
            getTempCH();
        }
        if (command == "getTempDHW")
        {
            getTempDHW();
        }
        if (command == "getTempOutside")
        {
            getTempOutside();
        }

        if (command == "setTypeConnect")
        {
            setTypeConnect(param[0].valD);
        }
        if (command == "setTCH")
        {
            setTCH(param[0].valD);
        }
        if (command == "setTCHFaultConn")
        {
            setTCHFaultConn(param[0].valD);
        }
        if (command == "setMinCH")
        {
            setMinCH(param[0].valD);
        }
        if (command == "setMaxCH")
        {
            setMaxCH(param[0].valD);
        }
        if (command == "setMinDHW")
        {
            setMinDHW(param[0].valD);
        }
        if (command == "setMaxDHW")
        {
            setMaxDHW(param[0].valD);
        }
        if (command == "setTDHW")
        {
            setTDHW(param[0].valD);
        }
        if (command == "setMaxModLevel")
        {
            setMaxModLevel(param[0].valD);
        }
        if (command == "setStatusCH")
        {
            setStatusCH((bool)param[0].valD);
        }
        if (command == "setStatusDHW")
        {
            setStatusDHW((bool)param[0].valD);
        }
        if (command == "setStatusCH2")
        {
            setStatusCH2((bool)param[0].valD);
        }

        if (command == "lockOutReset")
        {
            lockOutReset();
        }
        if (command == "rebootAdapter")
        {
            rebootAdapter();
        }
        return {};
    }

    void publishData(String widget, String status)
    {

        IoTItem *tmp = findIoTItem(widget);
        if (tmp)
            tmp->setValue(status, true);
        else
        {
            if (_debugLevel > 0)
                SerialPrint("i", "NEW", widget + " = " + status);
        }
    }

    static void sendTelegramm(String msg)
    {
        if (tlgrmItem)
            tlgrmItem->sendTelegramMsg(false, msg);
    }

    ~EctoControlAdapter(){};

    bool writeFunctionModBus(const uint16_t &reg, uint16_t &data)
    {
        // set word 0 of TX buffer to least-significant word of counter (bits 15..0)
        // node.setTransmitBuffer(1, lowWord(data));
        // set word 1 of TX buffer to most-significant word of counter (bits 31..16)
        node.setTransmitBuffer(0, data);
        // slave: write TX buffer to (2) 16-bit registers starting at register 0
        uint8_t result = node.writeMultipleRegisters(reg, 1);
        node.clearTransmitBuffer();
        if (_debug > 2)
        {
            SerialPrint("I", "EctoControlAdapter", "writeSingleRegister, addr: " + String((uint8_t)_addr, HEX) + ", reg: 0x" + String(reg, HEX) + ", state: " + String(data) + " = result: " + String(result, HEX));
        }
        if (result == 0)
            return true;
        else
            return false;
    }

    bool readFunctionModBus(const uint16_t &reg, uint16_t &reading)
    {
        if (_addr == 0) return false;
        // float retValue = 0;
        if (_modbusUART)
        {
            // if (!addr)
            //    addr = _addr;
            node.begin(_addr, _modbusUART);
            uint8_t result;
            // uint32_t reading;

            if (reg == 0x0000)
                result = node.readHoldingRegisters(reg, 4);
            else
                result = node.readHoldingRegisters(reg, 1);
            if (_debug > 2)
                SerialPrint("I", "EctoControlAdapter", "readHoldingRegisters, addr: " + String(_addr, HEX) + ", reg: 0x" + String(reg, HEX) + " = result: " + String(result, HEX));
            // break;
            if (result == node.ku8MBSuccess)
            {
                if (reg == 0x0000)
                {
                    reading = node.getResponseBuffer(0x03);
                    reading = (uint16_t)((uint8_t)(reading) >> 8);
                    SerialPrint("I", "EctoControlAdapter", "read info, addr: " + String(_addr, HEX) + ", type: " + String(reading, HEX));
                }
                else
                {
                    reading = node.getResponseBuffer(0x00);
                    if (_debug > 2)
                        SerialPrint("I", "EctoControlAdapter", "Success, Received data, register: " + String(reg) + " = " + String(reading, HEX));
                }
                node.clearResponseBuffer();
            }
            else
            {
                if (_debug > 2)
                    SerialPrint("E", "EctoControlAdapter", "Failed, Response Code: " + String(result, HEX));
                return false;
            }

            if (reading != 0x7FFF)
                return true;
            else
                return false;
        }
        return false;
    }

    bool getModelVersion()
    {
        uint16_t reqData;
        bool ret;
        ret = readFunctionModBus(ReadDataEctoControl::ecR_MemberCode, info.boilerMemberCode);
        ret = readFunctionModBus(ReadDataEctoControl::ecR_ModelCode, info.boilerModelCode);
        ret = readFunctionModBus(ReadDataEctoControl::ecR_AdaperVersion, reqData);
        info.adapterHardVer = highByte(reqData);
        info.adapterSoftVer = lowByte(reqData);
        return ret;
    }

    bool getBoilerInfo()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_AdapterInfo, reqData);
        info.adapterType = highByte(reqData) & 0xF8;
        info.boilerStatus = (highByte(reqData) >> 3) & 1u;
        info.rebootStatus = lowByte(reqData);
        if (ret)
        {
            publishData("adapterType", String(info.adapterType));
            publishData("boilerStatus", String(info.boilerStatus));
            publishData("rebootStatus", String(info.rebootStatus));
        }
        return ret;
    }
    bool getBoilerStatus()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_BoilerStatus, reqData);
        status.burnStatus = (lowByte(reqData) >> 0) & 1u;
        status.CHStatus = (lowByte(reqData) >> 1) & 1u;
        status.DHWStatus = (lowByte(reqData) >> 2) & 1u;
        if (ret)
        {
            publishData("burnStatus", String(status.burnStatus));
            publishData("CHStatus", String(status.CHStatus));
            publishData("DHWStatus", String(status.DHWStatus));
        }
        return ret;
    }
    bool getCodeError()
    {
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_CodeError, code);
        if (ret)
        {
            publishData("codeError", String(code));
            if (code)
                sendTelegramm("EctoControlAdapter: код ошибки: " + String((int)code));
        }
        return ret;
    }
    bool getCodeErrorExt()
    {
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_CodeErrorExt, codeExt);
        if (ret)
        {
            publishData("codeErrorExt", String(codeExt));
            if (codeExt)
                sendTelegramm("EctoControlAdapter: код ошибки: " + String((int)codeExt));
        }
        return ret;
    }
    bool getFlagErrorOT()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_FlagErrorOT, reqData);
        flagErr = lowByte(reqData);
        if (ret)
        {
            publishData("flagErr", String(flagErr));
            switch (flagErr)
            {
            case 0:
                sendTelegramm("EctoControlAdapter: Необходимо обслуживание!");
                break;
            case 1:
                sendTelegramm("EctoControlAdapter: Котёл заблокирован!");
                break;
            case 2:
                sendTelegramm("EctoControlAdapter: Низкое давление в отопительном контуре!");
                break;
            case 3:
                sendTelegramm("EctoControlAdapter: Ошибка розжига!");
                break;
            case 4:
                sendTelegramm("EctoControlAdapter: Низкое давления воздуха!");
                break;
            case 5:
                sendTelegramm("EctoControlAdapter: Перегрев теплоносителя в контуре!");
                break;
            default:
                break;
            }
        }
        return ret;
    }

    bool getFlowRate()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_FlowRate, reqData);
        flow = lowByte(reqData) / 10.f;
        if (ret)
            publishData("flowRate", String(flow));
        return ret;
    }
    bool getMaxSetCH()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_MaxSetCH, reqData);
        maxSetCH = (float)lowByte(reqData);
        if (ret)
            publishData("maxSetCH", String(maxSetCH));
        return ret;
    }
    bool getMaxSetDHW()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_MaxSetDHW, reqData);
        maxSetDHW = (float)lowByte(reqData);
        if (ret)
            publishData("maxSetDHW", String(maxSetDHW));
        return ret;
    }
    bool getMinSetCH()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_MinSetCH, reqData);
        minSetCH = (float)lowByte(reqData);
        if (ret)
            publishData("minSetCH", String(minSetCH));
        return ret;
    }
    bool getMinSetDHW()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_MinSetDHW, reqData);
        minSetDHW = (float)lowByte(reqData);
        if (ret)
            publishData("minSetDHW", String(minSetDHW));
        return ret;
    }
    bool getModLevel()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_ModLevel, reqData);
        modLevel = (float)lowByte(reqData);
        if (ret)
            publishData("modLevel", String(modLevel));
        return ret;
    }
    bool getPressure()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_Pressure, reqData);
        press = lowByte(reqData) / 10.f;
        if (ret)
            publishData("press", String(press));
        return ret;
    }
    bool getTempCH()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_TempCH, reqData);
        tCH = reqData / 10.f;
        if (ret)
            publishData("tCH", String(tCH));
        return ret;
    }
    bool getTempDHW()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_TempDHW, reqData);
        tDHW = reqData / 10.f;
        if (ret)
            publishData("tDHW", String(tDHW));
        return ret;
    }
    bool getTempOutside()
    {
        uint16_t reqData;
        bool ret = readFunctionModBus(ReadDataEctoControl::ecR_TempOutside, reqData);
        tOut = (float)lowByte(reqData);
        if (ret)
            publishData("tOut", String(tOut));
        return ret;
    }

    bool setTypeConnect(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_SetTypeConnect, data16))
        {
            // TODO запросить результат записи у адаптера
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setTypeConnect");
        }
        return ret;
    }
    bool setTCH(float &data)
    {
        bool ret = false;
        uint16_t d16 = data * 10;
        if (writeFunctionModBus(ecW_TSetCH, d16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setTCH");
        }

        return ret;
    }
    bool setTCHFaultConn(float &data)
    {
        bool ret = false;
        uint16_t d16 = data * 10;
        if (writeFunctionModBus(ecW_TSetCHFaultConn, d16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setTCHFaultConn");
        }
        return ret;
    }
    bool setMinCH(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_TSetMinCH, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setMinCH");
        }
        return ret;
    }
    bool setMaxCH(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_TSetMaxCH, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setMaxCH");
        }
        return ret;
    }
    bool setMinDHW(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_TSetMinDHW, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setMinDHW");
        }
        return ret;
    }
    bool setMaxDHW(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_TSetMaxDHW, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setMaxDHW");
        }
        return ret;
    }
    bool setTDHW(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_TSetDHW, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setTDHW");
        }
        return ret;
    }
    bool setMaxModLevel(float &data)
    {
        bool ret = false;
        uint16_t data16 = data;
        if (writeFunctionModBus(ecW_SetMaxModLevel, data16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setMaxModLevel");
        }
        return ret;
    }

    bool setStatusCH(bool data)
    {
        bool ret = false;
        enableCH = data;
        uint16_t stat = enableCH | (enableDHW << 1) | (enableCH2 << 2);
        if (writeFunctionModBus(ecW_SetStatusBoiler, stat))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setStatusCH");
        }
        return ret;
    }
    bool setStatusDHW(bool data)
    {
        bool ret = false;
        enableDHW = data;
        uint16_t stat = enableCH | (enableDHW << 1) | (enableCH2 << 2);
        if (writeFunctionModBus(ecW_SetStatusBoiler, stat))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setStatusDHW");
        }
        return ret;
    }
    bool setStatusCH2(bool data)
    {
        bool ret = false;
        enableCH2 = data;
        uint16_t stat = enableCH | (enableDHW << 1) | (enableCH2 << 2);
        if (writeFunctionModBus(ecW_SetStatusBoiler, stat))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, setStatusCH2");
        }
        return ret;
    }

    bool lockOutReset()
    {
        bool ret = false;
        uint16_t d16 = comm_LockOutReset;
        if (writeFunctionModBus(ecW_Command, d16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, lockOutReset");
        }
        return ret;
    }
    bool rebootAdapter()
    {
        bool ret = false;
        uint16_t d16 = comm_RebootAdapter;
        if (writeFunctionModBus(ecW_Command, d16))
        {
            ret = true;
        }
        else
        {
            if (_debug > 1)
                SerialPrint("E", "EctoControlAdapter", "Failed, rebootAdapter");
        }
        return ret;
    }
};

void *getAPI_EctoControlAdapter(String subtype, String param)
{

    if (subtype == F("ecAdapter"))
    {
        return new EctoControlAdapter(param);
    }
    {
        return nullptr;
    }
}
