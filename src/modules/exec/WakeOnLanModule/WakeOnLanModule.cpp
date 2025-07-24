// Licensed under the Cooperative Non-Violent Public License (CNPL)
// See: https://github.com/CHE77/IoTManager-Modules/blob/main/LICENSE

#include "Global.h"
#include "classes/IoTItem.h"

#include <WiFiUdp.h>
#include <WakeOnLan.h>

WiFiUDP UDP;        // Создаем объект WiFiUDP
WakeOnLan WOL(UDP); // Используем библиотеку WakeOnLan

class WakeOnLanModule : public IoTItem
{ 
private:
    String _macAddress; // MAC-адрес для пробуждения
    String _SecureOn = "";
    int _port = 9;
    int _repeats = 3;
    bool isInitiated = false;

public:
    WakeOnLanModule(String parameters) : IoTItem(parameters)
    {
        jsonRead(parameters, "MAC", _macAddress); // Чтение MAC-адреса из параметров
        _macAddress.replace("\"", "");
        if (!isValidMacAddress(_macAddress))
        {
            SerialPrint("E", "WakeOnLan", "Settings > MAC = " + _macAddress + " is not valid", _id);
            _macAddress = "";
        }

        jsonRead(parameters, "SecureOn", _SecureOn); // Чтение MAC-адреса из параметров
        _SecureOn.replace("\"", "");
        if (!_SecureOn.isEmpty() && !isValidMacAddress(_SecureOn))
        {
            SerialPrint("E", "WakeOnLan", "Settings > SecureOn = " + _SecureOn + " is not valid", _id);
            _SecureOn = "";
        }

        jsonRead(parameters, "port", _port); // Чтение MAC-адреса из параметров

        jsonRead(parameters, "repeats", _repeats); // Чтение MAC-адреса из параметров

        WOL.setRepeat(_repeats, 100); // Repeat the packet three times with 100ms delay between

        init();

    }

    void init()
    {
        if (isNetworkActive())
        {        // Рассчитываем broadcast-адрес
            IPAddress broadcastAddress = WOL.calculateBroadcastAddress(WiFi.localIP(), WiFi.subnetMask());
            WOL.setBroadcastAddress(broadcastAddress); // Устанавливаем broadcast-адрес
            isInitiated = true;
        }
    }

    bool isValidMacAddress(String mac)
    {
        // Удаляем двоеточия, если есть
        mac.replace(":", "");
        mac.toUpperCase();

        // Должно быть ровно 12 символов (6 байт в hex)
        if (mac.length() != 12)
            return false;

        // Проверка, что все символы — это HEX (0-9, A-F)
        for (int i = 0; i < 12; i++)
        {
            char c = mac.charAt(i);
            if (!isHexadecimalDigit(c))
                return false;
        }

        return true;
    }

    void setValue(const IoTValue &Value, bool genEvent = true)
    {
        value = Value;

        if (value.valD == 1 && isNetworkActive())
        {
            if (!isInitiated) init();

            if (!_macAddress.isEmpty() && !_SecureOn.isEmpty())
            {
                WOL.sendSecureMagicPacket(_macAddress, _SecureOn, _port);
                SerialPrint("I", "WakeOnLan", "setValue, _SecureOn = " + _SecureOn, _id);
            }
            else if (!_macAddress.isEmpty())
            {
                WOL.sendMagicPacket(_macAddress, _port); // Отправка Magic Packet
            }
            else
            {
                SerialPrint("E", "WakeOnLan", "Settings > MAC and/or SecureOn - not set or not valid", _id);
            }
        }
        regEvent((String)(int)value.valD, "WakeOnLan", false, genEvent);
    }

    IoTValue execute(String command, std::vector<IoTValue> &param)
    {
        if (!isInitiated) init();

        if (command == "mac")
        {
            String macTarget = "";

            if (param.size() == 1 && isValidMacAddress(param[0].valS))
            {
                macTarget = param[0].valS;
                WOL.sendMagicPacket(macTarget); // Отправка Magic Packet
            }
            else if (param.size() == 2 && isValidMacAddress(param[0].valS))
            {
                macTarget = param[0].valS;
                int portNum = param[1].valD;
                WOL.sendMagicPacket(macTarget, portNum); // Отправка Magic Packet
            }
            else if (param.size() == 3 && isValidMacAddress(param[0].valS) && isValidMacAddress(param[1].valS))
            {
                macTarget = param[0].valS;
                String secureOn = param[1].valS;
                int portNum = param[2].valD;
                WOL.sendSecureMagicPacket(macTarget, secureOn, portNum);
            }
            else
            {
                SerialPrint("E", "WakeOnLan", "MAC and/or SecureOn - not valid", _id);
                return {};
            }

            SerialPrint("I", "WakeOnLan", "execute, Magic Packet sent to " + macTarget, _id);
        }

        return {}; // команда поддерживает возвращаемое значения. Т.е. по итогу выполнения команды или общения с внешней системой, можно вернуть значение в сценарий для дальнейшей обработки
    }
    /*
        String getValue() {
            return (String)(int)value.valD;
        }
    */
    void doByInterval() {}
};

void *getAPI_WakeOnLanModule(String subtype, String param)
{
    if (subtype == F("WakeOnLanModule"))
    {
        return new WakeOnLanModule(param); // Используем новое имя класса
    }
    else
    {
        return nullptr;
    }
}