// Licensed under the Cooperative Non-Violent Public License (CNPL)
// See: https://github.com/CHE77/IoTManager-Modules/blob/main/LICENSE

#include "Global.h"
#include "classes/IoTItem.h"
// #include <ctime>
#include <SolarCalculator.h>
#include "NTP.h"

class SolarCalculator : public IoTItem
{
private:
    float _lat = 0;
    float _long = 0;

    int year = 0;
    int month = 0;
    int day = 0;
    int hour = 0;
    int minute = 0;
    int second = 0;

    unsigned long _sunriseTime = 0;
    unsigned long _transitTime = 0;
    unsigned long _sunsetTime = 0;

    String _parameter = "";
    bool _ticker = false;
    bool _debug = false;

    // Rounded HH:mm format
    char *hoursToString(double h, char *str)
    {
        int m = int(round(h * 60));
        int hr = (m / 60) % 24;
        int mn = m % 60;

        str[0] = (hr / 10) % 10 + '0';
        str[1] = (hr % 10) + '0';
        str[2] = ':';
        str[3] = (mn / 10) % 10 + '0';
        str[4] = (mn % 10) + '0';
        str[5] = '\0';
        return str;
    }

public:
    SolarCalculator(String parameters) : IoTItem(parameters)
    {
        jsonRead(parameters, "lat", _lat);
        jsonRead(parameters, "lon", _long);
        _parameter = jsonReadStr(parameters, "parameter");
        jsonRead(parameters, F("ticker"), _ticker);
        jsonRead(parameters, F("debug"), _debug);
    }

    void getTime()
    {
        unixTime = getSystemTime();
        breakEpochToTime(unixTime, _time_utc);

        day = _time_utc.day_of_month;
        month = _time_utc.month;
        year = _time_utc.year + 2000; // 0-25

        hour = _time_utc.hour;
        minute = _time_utc.minute;
        second = _time_utc.second;
    }

    void sunArcFromTransit(double longitude, double &sunArc)
    {
        JulianDay jd(year, month, day, hour, minute, second);
        double T = calcJulianCent(jd);

        // Получаем экваториальные координаты Солнца
        double ra, dec;
        calcSolarCoordinates(T, ra, dec); // ra в градусах, dec тоже

        double GMST = calcGrMeanSiderealTime(jd);
        double ghaSun = wrapTo360(GMST - ra);

        // LHA = GHA + долгота наблюдателя (восточная долгота положительная)
        double lha = wrapTo180(ghaSun + longitude);

        // Угол от транзита: 0° — транзит, 90° — 6 часов позже и т.д.
        sunArc = lha;
    }

    void doByInterval()
    {
        if (isTimeSynch)
        {
            getTime();
            JulianDay jd(year, month, day, hour, minute, second);

            double azimuth, elevation;
            calcHorizontalCoordinates(jd, _lat, _long, azimuth, elevation);

            value.isDecimal = true;
            if (_parameter == "azimuth")
            {
                value.valD = azimuth;
            }
            else if (_parameter == "elevation")
            {
                value.valD = elevation;
            }
            else if (_parameter == "sunArcFromTransit")
            {
                double sunArc;
                sunArcFromTransit(_long, sunArc);
                value.valD = sunArc;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), _parameter + " is not correct parameter!!!");
                return;
            }

            regEvent(value.valD, F("SoftRTC"), _debug, _ticker);
        }
    }

    IoTValue execute(String command, std::vector<IoTValue> &param)
    {
        if (command == "sunrise")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() == 3 && param[0].isDecimal && param[1].isDecimal && param[2].isDecimal)
            {
                year = param[2].valD;
                month = param[1].valD;
                day = param[0].valD;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            double transit, sunrise, sunset;
            calcSunriseSunset(year, month, day, _lat, _long, transit, sunrise, sunset);

            int utc_offset = jsonReadInt(settingsFlashJson, F("timezone"));

            char str[6];
            IoTValue valTmp;
            valTmp.isDecimal = false;
            valTmp.valS = hoursToString(sunrise + utc_offset, str);
            return valTmp;
        }
        else if (command == "transit")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() == 3 && param[0].isDecimal && param[1].isDecimal && param[2].isDecimal)
            {
                year = param[2].valD;
                month = param[1].valD;
                day = param[0].valD;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            double transit, sunrise, sunset;
            calcSunriseSunset(year, month, day, _lat, _long, transit, sunrise, sunset);

            int utc_offset = jsonReadInt(settingsFlashJson, F("timezone"));

            char str[6];
            IoTValue valTmp;
            valTmp.isDecimal = false;
            valTmp.valS = hoursToString(transit + utc_offset, str);
            return valTmp;
        }
        else if (command == "sunset")
        {

            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() == 3 && param[0].isDecimal && param[1].isDecimal && param[2].isDecimal)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            double transit, sunrise, sunset;
            calcSunriseSunset(year, month, day, _lat, _long, transit, sunrise, sunset);

            int utc_offset = jsonReadInt(settingsFlashJson, F("timezone"));

            char str[6];
            IoTValue valTmp;
            valTmp.isDecimal = false;
            valTmp.valS = hoursToString(sunset + utc_offset, str);
            return valTmp;
        }
        else if (command == "azimuth")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            JulianDay jd(year, month, day, hour, minute, second);
            double azimuth, elevation;
            calcHorizontalCoordinates(jd, _lat, _long, azimuth, elevation);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = azimuth;
            return valTmp;
        }
        else if (command == "elevation")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            JulianDay jd(year, month, day, hour, minute, second);
            double azimuth, elevation;
            calcHorizontalCoordinates(jd, _lat, _long, azimuth, elevation);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = elevation;
            return valTmp;
        }
        else if (command == "sunArcFromTransit")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameter!s or time is not synched!!", _id);
                return {};
            }

            double sunArc;
            sunArcFromTransit(_long, sunArc);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = sunArc;
            return valTmp;
        }
        else if (command == "jd")
        {
            //  float hours = 0;
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameters or time is not synched!!", _id);
                return {};
            }
            JulianDay jd(year, month, day, hour, minute, second);
            float jdJD = jd.JD;
            float jdm = jd.m;
            float jdSum = jdJD + jdm;
            //SerialPrint("I", F("SolarCalc"), "jdJD = " + String(jdJD));
            //SerialPrint("I", F("SolarCalc"), "jdm = " + String(jdm));
            //SerialPrint("I", F("SolarCalc"), "jdSum = " + String(jdSum));
            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = jdSum;
            return valTmp;
        }
        else if (command == "GMST")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameters or time is not synched!!", _id);
                return {};
            }
            JulianDay jd(year, month, day, hour, minute, second);
            double GMST = calcGrMeanSiderealTime(jd);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = GMST;
            return valTmp;
        }
        else if (command == "LST")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameters or time is not synched!!", _id);
                return {};
            }

            JulianDay jd(year, month, day, hour, minute, second);
            double GMST = calcGrMeanSiderealTime(jd);
            double LST = wrapTo360(GMST + _long);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = LST;
            return valTmp;
        }
        else if (command == "ra")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameters or time is not synched!!", _id);
                return {};
            }

            JulianDay jd(year, month, day, hour, minute, second);
            double T = calcJulianCent(jd);
            double ra, dec;
            calcSolarCoordinates(T, ra, dec);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = ra;
            return valTmp;
        }
        else if (command == "dec")
        {
            if (param.size() == 0 && isTimeSynch)
            {
                getTime();
            }
            else if (param.size() > 3)
            {
                day = param[0].valD;
                month = param[1].valD;
                year = param[2].valD;
                hour = param[3].valD;
                minute = (param.size() > 4) ? param[4].valD : 0;
                second = (param.size() > 5) ? param[5].valD : 0;
            }
            else
            {
                SerialPrint("E", F("SolarCalculator"), "Wrong parameters or time is not synched!!", _id);
                return {};
            }

            JulianDay jd(year, month, day, hour, minute, second);
            double T = calcJulianCent(jd);
            double ra, dec;
            calcSolarCoordinates(T, ra, dec);

            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = dec;
            return valTmp;
        }
        else if (command == "getHour" && param.size() == 1)
        { // получаем час из какого-то элемента и переводим его в UTC

            int h = selectToMarker(param[0].valS, ":").toInt();
            int utc_offset = jsonReadInt(settingsFlashJson, F("timezone"));
            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = h - utc_offset;
            return valTmp;
        }
        else if (command == "getMinute" && param.size() == 1)
        { // получаем минуты из какого-то элемента и переводим его в UTC
            int min = selectToMarkerLast(param[0].valS, ":").toInt();
            IoTValue valTmp;
            valTmp.isDecimal = true;
            valTmp.valD = min;
            return valTmp;
        }
        else
            SerialPrint("E", F("SolarCalculator"), F("Unknown command or wrong parameters."));
        return {};
    }
};

void *getAPI_SolarCalculator(String subtype, String param)
{
    if (subtype == F("SolarCalculator"))
    {
        return new SolarCalculator(param);
    }
    return nullptr;
}
