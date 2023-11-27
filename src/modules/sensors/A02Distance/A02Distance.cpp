
#include "Global.h"
#include "classes/IoTItem.h"

#include "modules/sensors/UART/Uart.h"

#define READ_TIMEOUT 100

class A02Distance : public IoTItem
{
private:
public:
    A02Distance(String parameters) : IoTItem(parameters)
    {
        if (myUART)
        {
        }
    }

//Периодическое выполнение программы, в int секунд, которые зададим в конфигурации
    void doByInterval()
    {
        if (myUART)
        {
            static uint8_t data[4];

            if (recieve(data, 4) == 4)
            {
                if (data[0] == 0xff)
                {
                    int sum;
                    sum = (data[0] + data[1] + data[2]) & 0x00FF;
                    if (sum == data[3])
                    {
                        float distance = (data[1] << 8) + data[2];
                        if (distance > 30)
                        {
                            value.valD = distance / 10;
                            //SerialPrint("i", F("A02Distance"), "distance = " + String(value.valD) + "cm");
                            regEvent(value.valD, "A02Distance");
                        }
                        else
                        {
                            SerialPrint("E", "A02Distance", "Below the lower limit");
                            regEvent(NAN, "A02Distance");
                        }
                    }
                    else
                    {
                        regEvent(NAN, "A02Distance");
                        SerialPrint("E", "A02Distance", "Distance data error");
                    }
                }
            } else {
                regEvent(NAN, "A02Distance");
                SerialPrint("E", "A02Distance", "Recieve data error");
            }
        } else
        {
            regEvent(NAN, "A02Distance");
            SerialPrint("E", "A02Distance", "Not find UART");
        }
        
    }


    //Приём данных из COM порта
    uint16_t recieve(uint8_t *resp, uint16_t len)
    {
        ((SoftwareSerial *)myUART)->listen(); // Start software serial listen
        unsigned long startTime = millis();   // Start time for Timeout
        uint8_t index = 0;                    // Bytes we have read
        while ((index < len) && (millis() - startTime < READ_TIMEOUT))
        {
            if (myUART->available() > 0)
            {
                uint8_t c = (uint8_t)myUART->read();
                resp[index++] = c;
            }
        }
        return index;
    }

    ~A02Distance(){};
#if defined(Dev_GetSize) && Dev_GetSize == 1
    int32_t getSize(){ return sizeof(*this); }
#endif
};


//Функиця ядра, чтобы нашел наш модуль
void *getAPI_A02Distance(String subtype, String param)
{
    if (subtype == F("A02Distance"))
    {
        return new A02Distance(param);
    }
    else
    {
        return nullptr;
    }
}
