// Licensed under the Cooperative Non-Violent Public License (CNPL)
// See: https://github.com/CHE77/IoTManager-Modules/blob/main/LICENSE

#include "Global.h"
#include "classes/IoTItem.h"

extern IoTGpio IoTgpio;

// Это файл сенсора, в нем осуществляется чтение сенсора.
// для добавления сенсора вам нужно скопировать этот файл и заменить в нем текст NoiseAdc на название вашего сенсора
// Название должно быть уникальным, коротким и отражать суть сенсора.

// ребенок       -       родитель
class NoiseAdc : public IoTItem
{
private:
    //=======================================================================================================
    // Секция переменных.
    // Это секция где Вы можете объявлять переменные и объекты arduino библиотек, что бы
    // впоследствии использовать их в loop и setup

#ifdef ESP8266
    float adcRange = 1023.0;
    const int maxSamples = 100;
    int samples[100];
    float deltas[100]; // отклонения от среднего

#else
    float adcRange = 4095.0;
    const int maxSamples = 200;
    int samples[200];
    float deltas[200]; // отклонения от среднего
#endif

    unsigned int _pin;
    unsigned int _steps;
    unsigned int _period = 0;
    unsigned long _lastSoundingMillis = 0;

    int sampleIndex = 0;

    float _referenceVoltage = 0.02; // калибровочный "тихий" уровень
    float vcc = 3.3;

    String _parameter = "";

    float mean = 0;
    float minVal = 0;
    float maxVal = 0;
    float rms = 0;
    float peak = 0;
    float median = 0;
    float minValMean = 0;
    float maxValMean = 0;
    float peakToPeak = 0;
    float peakVoltage = 0;
    float db = 0;

    bool _debug = false;

public:
    //=======================================================================================================
    // setup()
    // это аналог setup из arduino. Здесь вы можете выполнять методы инициализации сенсора.
    // Такие как ...begin и подставлять в них параметры полученные из web интерфейса.
    // Все параметры хранятся в перемененной parameters, вы можете прочитать любой параметр используя jsonRead функции:
    // jsonReadStr, jsonReadBool, jsonReadInt
    NoiseAdc(String parameters) : IoTItem(parameters)
    {
        _pin = jsonReadInt(parameters, "pin");
        _steps = jsonReadInt(parameters, "steps");
        if (_steps > maxSamples)
            _steps = maxSamples;

        if (_steps < 10)
            _steps = 10;
        _period = _interval / _steps;
        if (_debug)
            SerialPrint("i", F("NoiseAdc"), "_period = " + String(_period));

        jsonRead(parameters, F("refVoltage"), _referenceVoltage, false);
        if (_referenceVoltage == 0)
            _referenceVoltage = 0.01;

        _parameter = jsonReadStr(parameters, "parameter");
        jsonRead(parameters, F("debug"), _debug);
    }

    //=======================================================================================================

    void doByInterval()
    {
        float result = analyzeSamples(_parameter);

        if (result)
        {
            value.valD = result;
            regEvent(value.valD, "NoiseAdc", _debug, true); // обязательный вызов хотяб один
        }
    }

    //=======================================================================================================
    // loop()
    // полный аналог loop() из arduino. Нужно помнить, что все модули имеют равный поочередный доступ к центральному loop(), поэтому, необходимо следить
    // за задержками в алгоритме и не создавать пауз. Кроме того, данная версия перегружает родительскую, поэтому doByInterval() отключается, если
    // не повторить механизм расчета интервалов.
    void loop()
    {

        if (millis() > _lastSoundingMillis + _period && sampleIndex < maxSamples)
        {
            _lastSoundingMillis = millis();
            samples[sampleIndex++] = IoTgpio.analogRead(_pin);
        }

        IoTItem::loop();
    }

    void onModuleOrder(String &key, String &value)
    {
        if (key == "setRefVoltage")
        {
            _referenceVoltage = analyzeSamples("peakVoltage");
            SerialPrint("i", F("NoiseAdc"), "User run calibration referenceVoltage " + String(_referenceVoltage));
            // TODO wtitejson to config.json?????
        }
    }

    IoTValue execute(String command, std::vector<IoTValue> &param)
    {
        if (command == "parameter")
        {
            if (param.size() == 1 && !param[0].isDecimal)
            {

                String parameter = param[0].valS.c_str();

                float output = 0;

                if (parameter == "mean")
                {
                    output = mean;
                }
                else if (parameter == "minVal")
                {
                    output = minVal;
                }
                else if (parameter == "maxVal")
                {
                    output = maxVal;
                }
                else if (parameter == "RMS")
                {
                    output = rms;
                }
                else if (parameter == "median")
                {
                    output = median;
                }
                else if (parameter == "minValMean")
                {
                    output = minValMean;
                }
                else if (parameter == "maxValMean")
                {
                    output = maxValMean;
                }
                else if (parameter == "peak")
                {
                    output = peak;
                }
                else if (parameter == "peakToPeak")
                {
                    output = peakToPeak;
                }
                else if (parameter == "peakVoltage")
                {
                    output = peakVoltage;
                }
                else if (parameter == "db")
                {
                    output = db;
                }
                else
                {
                }

                if (_debug)
                    SerialPrint("i", F("NoiseAdc"), "execute parameter " + String(parameter) + " = " + String(output));

                if (output)
                {
                    IoTValue valTmp;
                    valTmp.isDecimal = true;
                    valTmp.valD = output;
                    return valTmp;
                }
            }
        }

        return {}; // команда поддерживает возвращаемое значения. Т.е. по итогу выполнения команды или общения с внешней системой, можно вернуть значение в сценарий для дальнейшей обработки
    }

    float analyzeSamples(String parameter)
    {
        if (sampleIndex < 5)
        {
            if (_debug)
                SerialPrint("i", F("NoiseAdc"), "Нет данных для анализа");
            return 0;
        }

        minVal = samples[0];
        maxVal = samples[0];
        float sum = 0;
        for (int i = 0; i < sampleIndex; i++)
        {
            if (samples[i] < minVal)
                minVal = samples[i];
            if (samples[i] > maxVal)
                maxVal = samples[i];
            sum += samples[i];
        }

        mean = sum / sampleIndex;

        for (int i = 0; i < sampleIndex; i++)
        {
            deltas[i] = samples[i] - mean;
        }

        rms = 0;

        minValMean = deltas[0];
        maxValMean = deltas[0];

        peak = 0;

        for (int i = 0; i < sampleIndex; i++)
        {
            rms += deltas[i] * deltas[i];

            if (deltas[i] < minValMean)
                minValMean = deltas[i];
            if (deltas[i] > maxValMean)
                maxValMean = deltas[i];

            if (abs(deltas[i] > peak))
                peak = abs(deltas[i]);
        }

        rms = sqrt(rms / sampleIndex);

        peakToPeak = maxValMean - minValMean;

        float sorted[maxSamples];
        memcpy(sorted, deltas, sizeof(float) * sampleIndex);
        std::sort(sorted, sorted + sampleIndex);
        median = (sampleIndex % 2 == 0) ? (sorted[sampleIndex / 2 - 1] + sorted[sampleIndex / 2]) / 2.0 : sorted[sampleIndex / 2];

        peakVoltage = peakToPeak * vcc / adcRange;
        db = 20.0 * log10(peakVoltage / _referenceVoltage);
        if (peakVoltage < _referenceVoltage)
            db = 0;
        if (_debug)
        {
            Serial.println("== Анализ завершен ==");
            Serial.print("Сэмплов: ");
            Serial.println(sampleIndex);
            Serial.print("Среднее (DC): ");
            Serial.println(mean, 2);
            Serial.print("Мин/Макс (Aбс): ");
            Serial.print(minVal, 2);
            Serial.print(" / ");
            Serial.println(maxVal, 2);
            Serial.print("RMS (AC): ");
            Serial.println(rms, 2);
            Serial.print("Медиана (AC): ");
            Serial.println(median, 2);
            Serial.print("Мин/Макс (AC): ");
            Serial.print(minValMean, 2);
            Serial.print(" / ");
            Serial.println(maxValMean, 2);
            Serial.print("Абсолютный пик (AC): ");
            Serial.println(peak, 2);
            Serial.print("Размах (AC): ");
            Serial.println(peakToPeak, 2);
            Serial.print("Размах в вольтах: ");
            Serial.println(peakVoltage, 4);
            Serial.print("Уровень звука ≈ dB SPL: ");
            Serial.println(db, 1);
        }

        sampleIndex = 0;

        if (parameter == "mean")
        {
            return mean;
        }
        else if (parameter == "minVal")
        {
            return minVal;
        }
        else if (parameter == "maxVal")
        {
            return maxVal;
        }
        else if (parameter == "RMS")
        {
            return rms;
        }
        else if (parameter == "median")
        {
            return median;
        }
        else if (parameter == "minValMean")
        {
            return minValMean;
        }
        else if (parameter == "maxValMean")
        {
            return maxValMean;
        }
        else if (parameter == "peak")
        {
            return peak;
        }
        else if (parameter == "peakToPeak")
        {
            return peakToPeak;
        }
        else if (parameter == "peakVoltage")
        {
            return peakVoltage;
        }
        else if (parameter == "db")
        {
            return db;
        }
        else
        {
            return 0;
        }
    }

    ~NoiseAdc() {};
};

void *getAPI_NoiseAdc(String subtype, String param)
{
    if (subtype == F("NoiseAdc"))
    {
        return new NoiseAdc(param);
    }
    else
    {
        return nullptr;
    }
}
