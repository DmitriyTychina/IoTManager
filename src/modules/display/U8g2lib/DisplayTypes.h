#pragma once
#include "Global.h"
#include <U8g2lib.h>
#include <Print.h>
#include <stdint.h>

// #define DEBUG_DISPLAY

#define DEFAULT_PAGE_UPDATE_ms 500
// #define DEFAULT_PAGE_TIME_ms 5000
// #define DEFAULT_ROTATION 0
// #define DEFAULT_CONTRAST 10
#define MIN_CONTRAST 10
#define MAX_CONTRAST 150

#ifndef DEBUG_DISPLAY
#define D_LOG(fmt, ...) \
    do {                \
        (void)0;        \
    } while (0)
#else
#define D_LOG(fmt, ...) Serial.printf((PGM_P)PSTR(fmt), ##__VA_ARGS__)
#endif

enum rotation_t : uint8_t {
    ROTATION_NONE,
    ROTATION_90,
    ROTATION_180,
    ROTATION_270
};

uint8_t parse_contrast(int val) {
    if (val < MIN_CONTRAST) val = MIN_CONTRAST;
    if (val > MAX_CONTRAST) val = MAX_CONTRAST;
    return val;
};

rotation_t parse_rotation(int val) {
    if ((val > 0) && (val <= 90)) return ROTATION_90;
    if ((val > 90) && (val <= 180)) return ROTATION_180;
    if ((val > 180) && (val <= 270)) return ROTATION_270;
    return ROTATION_NONE;
};

struct DisplayPage {
    String key;
    uint16_t time;
    rotation_t rotate;
    String font;
    String format;
    String valign;

    DisplayPage(
        const String& key,
        uint16_t time,
        rotation_t rotate,
        const String& font, 
        const String& format,
        const String& valign) : key{key}, time{time}, rotate{rotate}, font{font}, format{format}, valign{valign} {}

    // void load(const JsonObject& obj) {
    //     // time = obj["time"].as<uint16_t>();
    //     // rotate = parse_rotation(obj["rotate"].as<int>());
    //     // font = obj["font"].as<char*>();
    //     // valign = obj["valign"].as<char*>();
    //     // format = obj["format"].as<char*>();
    // }
    
    // auto item = DisplayPage( pageObj["key"].as<char*>(), _update, _rotate, _font);
    // // Загрузка настроек страницы
    // item.load(pageObj);
    // page.push_back(item);


};

enum position_t {
    POS_AUTO,
    POS_ABSOLUTE,
    POS_RELATIVE,
    POS_TEXT
};

struct RelativePosition {
    float x;
    float y;
};

struct TextPosition {
    uint8_t row;
    uint8_t col;
};

struct Point {
    uint16_t x;
    uint16_t y;

    Point() : Point(0, 0) {}

    Point(uint16_t x, uint16_t y) : x{x}, y{y} {}

    Point(const Point& rhv) : Point(rhv.x, rhv.y) {}
};

struct Position {
    position_t type;
    union {
        Point abs;
        RelativePosition rel;
        TextPosition text;
    };

    Position() : type{POS_AUTO} {}

    Position(const Point& pos) : type{POS_ABSOLUTE} {
        abs.x = pos.x;
        abs.y = pos.y;
    }

    Position(const RelativePosition& pos) : type{POS_RELATIVE} {
        rel.x = pos.x;
        rel.y = pos.y;
    }

    Position(const TextPosition& pos) : type{POS_TEXT} {
        text.col = pos.col;
        text.row = pos.row;
    }

    Position(const Position& rhv) : type{rhv.type} {
        switch (type) {
            case POS_ABSOLUTE:
                abs = rhv.abs;
            case POS_RELATIVE:
                rel = rhv.rel;
            case POS_TEXT:
                text = rhv.text;
            default:
                break;
        }
    }
};

class Cursor : public Printable {
   private:
    Point _size;

   public:
    TextPosition pos{0, 0};
    Point abs{0, 0};
    Point chr;
    Cursor(){};

    Cursor(const Point& size, const Point& chr) : _size{size}, chr{chr} {
        D_LOG("w: %d, h: %d, ch: %d(%d)\r\n", _size.x, _size.y, chr.x, chr.y);
    }

    void reset() {
        pos.col = 0;
        pos.row = 0;
        abs.x = 0;
        abs.y = 0;
    }

    void lineFeed() {
        pos.col = 0;
        pos.row++;
        abs.x = 0;
        abs.y += chr.y;
    }

    void moveX(uint8_t x) {
        abs.x += x;
        pos.col = abs.x / chr.x;
    }

    void moveY(uint8_t y) {
        abs.y += y;
    }

    void moveXY(uint8_t x, uint8_t y) {
        moveX(x);
        moveY(y);
    }

    void moveCarret(uint8_t col) {
        pos.col += col;
        moveX(col * chr.x);
    }

    bool isEndOfPage(uint8_t rows = 1) {
        return (abs.y + (rows * chr.y)) > _size.y;
    }

    bool isEndOfLine(uint8_t cols = 1) {
        return (abs.x + (cols * chr.x)) > _size.x;
    }

    size_t printTo(Print& p) const {
        return p.printf("(c:%d, r:%d x:%d, y:%d)", pos.col, pos.row, abs.x, abs.y);
    }
};


struct DisplayHardwareSettings {
    int update = DEFAULT_PAGE_UPDATE_ms;
    rotation_t rotate;
    String font;
    int pageTime;
    String pageFormat;
    int contrast;
    bool autoPage;
    String valign;
};

class Display {
   private:
    unsigned long _lastResfresh{0};
    Cursor _cursor;
    U8G2 *_obj{nullptr};
    DisplayHardwareSettings *_settings;

   public:
    Display(U8G2 *obj, DisplayHardwareSettings *settings) : _obj{obj}, _settings(settings) {
        _obj->begin();
        _obj->enableUTF8Print();
        _obj->setContrast(_settings->contrast);
        setFont(settings->font);
        setRotation(settings->rotate);
        clear();
    }

    ~Display () {
        if (_obj) {
            delete _obj;
            _obj = nullptr;
        }
    }

    void setRotation(rotation_t rotate) {
        switch (rotate) {
            case ROTATION_NONE:
                _obj->setDisplayRotation(U8G2_R0);
                break;
            case ROTATION_90:
                _obj->setDisplayRotation(U8G2_R1);
                break;
            case ROTATION_180:
                _obj->setDisplayRotation(U8G2_R2);
                break;
            case ROTATION_270:
                _obj->setDisplayRotation(U8G2_R3);
                break;
        }
    }

    void setFont(const String &fontName = "") {
        if (fontName.isEmpty()) {
           Display::setFont(_settings->font);
           return;
        }

        if (fontName.startsWith("c6x12"))
            _obj->setFont(u8g2_font_6x12_t_cyrillic);
        else if (fontName.startsWith("s6x12"))
            _obj->setFont(u8g2_font_6x12_t_symbols);
        
        else if (fontName.startsWith("c6x13"))
            _obj->setFont(u8g2_font_6x13_t_cyrillic);

        else if (fontName.startsWith("c7x13"))
            _obj->setFont(u8g2_font_7x13_t_cyrillic);
        else if (fontName.startsWith("s7x13"))
            _obj->setFont(u8g2_font_7x13_t_symbols);

        else if (fontName.startsWith("c8x13"))
            _obj->setFont(u8g2_font_8x13_t_cyrillic);
        else if (fontName.startsWith("s8x13"))
            _obj->setFont(u8g2_font_8x13_t_symbols);

        else if (fontName.startsWith("c9x15"))
            _obj->setFont(u8g2_font_9x15_t_cyrillic);
        else if (fontName.startsWith("s9x15"))
            _obj->setFont(u8g2_font_9x15_t_symbols);

        else if (fontName.startsWith("c10x20"))
            _obj->setFont(u8g2_font_10x20_t_cyrillic);
        else if (fontName.startsWith("unifont"))
            _obj->setFont(u8g2_font_unifont_t_symbols);
        else if (fontName.startsWith("siji"))
            _obj->setFont(u8g2_font_siji_t_6x10);
        else
            _obj->setFont(u8g2_font_6x12_t_cyrillic);

        _cursor.chr.x = getMaxCharHeight();
        // _cursor.chr.y = getLineHeight();
    }

    void initCursor() {
        _cursor = Cursor(
            {getWidth(), getHeight()},
            {getMaxCharHeight(), getLineHeight()});
    }

    void getPosition(const TextPosition &a, Point &b) {
        b.x = a.col * _cursor.chr.x;
        b.y = (a.row + 1) * _cursor.chr.y;
    }

    void getPosition(const RelativePosition &a, Point &b) {
        b.x = getHeight() * a.x;
        b.y = getWidth() * a.y;
    }

    void getPosition(const Point &a, TextPosition &b) {
        b.row = a.y / getLineHeight();
        b.col = a.x / getMaxCharWidth();
    }

    void getPosition(const RelativePosition &a, TextPosition &b) {
        Point tmp;
        getPosition(a, tmp);
        getPosition(tmp, b);
    }

    void draw(const RelativePosition &pos, const String &str) {
        Point tmp;
        getPosition(pos, tmp);
        draw(tmp, str);
    }

    void draw(TextPosition &pos, const String &str) {
        Point tmp;
        getPosition(pos, tmp);
        draw(tmp, str);
    }

    Cursor *getCursor() {
        return &_cursor;
    }

    // print меняю cursor
    void println(const String &str, bool frame = false) {
        print(str, frame);
        _cursor.lineFeed();
    }

    void print(const String &str, bool frame = false) {
        //Serial.print(_cursor);
        // x, y нижний левой
        int width = _obj->drawUTF8(_cursor.abs.x, _cursor.abs.y + _cursor.chr.y, str.c_str());
        if (frame) {
            int x = _cursor.abs.x - getXSpacer();
            int y = _cursor.abs.y - _cursor.chr.y;
            width += (getXSpacer() * 2);
            int height = _cursor.chr.y + getYSpacer() * 2;
            // x, y верхней левой. длина, высота
            _obj->drawFrame(x, y, width, height);
            D_LOG("[x:%d y:%d w:%d h:%d]", x, y, width, height);
        }
        _cursor.moveX(width);
    }

    // draw не меняет cursor
    void draw(const Point &pos, const String &str) {
        Serial.printf("(x:%d,y:%d) %s", pos.x, pos.y, str.c_str());
        _obj->drawStr(pos.x, pos.y, str.c_str());
    }

    uint8_t getLineHeight() {
        return getMaxCharHeight() + getYSpacer();
    }

    int getXSpacer() {
        int res = getWidth() / 100;
        if (!res) res = 1;
        return res;
    }

    int getYSpacer() {
        int res = (getHeight() - (getLines() * getMaxCharHeight())) / getLines();
        if (!res) res = 1;
        return res;
    }

    uint8_t getWidth() {
        return _obj->getDisplayWidth();
    }

    uint8_t getHeight() {
        return _obj->getDisplayHeight();
    }

    uint8_t getLines() {
        uint8_t res = getHeight() / _obj->getMaxCharHeight();
        if (!res) res = 1;
        return res;
    }

    uint8_t getMaxCharHeight() {
        return _obj->getMaxCharHeight();
    }

    uint8_t getMaxCharWidth() {
        return _obj->getMaxCharWidth();
    }

    void clear() {
        _obj->clearDisplay();
        _cursor.reset();
    }

    void startRefresh() {
        _obj->clearBuffer();
        _cursor.reset();
    }

    void endRefresh() {
        _obj->sendBuffer();
        _lastResfresh = millis();
    }

    bool isNeedsRefresh() {
        // SerialPrint("[Display]", "_settings->update: " + String(_settings->update) + "ms", "");
        return !_lastResfresh || (millis() > (_lastResfresh + _settings->update));
    }
};

struct ParamPropeties {
    // рамка
    bool frame[false];
};

struct Param {
    // Ключ
    const String key;
    // Префикс к значению
    String pref;
    // Суффикс к значению
    String suff;
    // Значение
    String value;

    String pref_fnt;
    String suff_fnt;
    String value_fnt;

    String gliphs;

    // значение изменилось
    bool updated;
    // группа
    uint8_t group;
    ParamPropeties props;
    Position position;

    Param(const String &key, 
        const String &pref = emptyString, const String &value = emptyString, const String &suff = emptyString, 
        const String &pref_fnt = emptyString, const String &value_fnt = emptyString, const String &suff_fnt = emptyString,
        const String &gliphs = emptyString
    ) : key{key}, group{0} {
        setValue(value.c_str());
        setPref(pref);
        setSuff(suff);
        this->pref_fnt = pref_fnt;
        this->value_fnt = value_fnt;
        this->suff_fnt = suff_fnt;
        this->gliphs = gliphs;
        updated = false;
    }

    bool isValid() {
        return !pref.isEmpty();
    }

    bool setPref(const String &str) {
        if (!pref.equals(str)) {
            pref = str;
            updated = true;
            return true;
        }
        return false;
    }

    bool setSuff(const String &str) {
        if (!suff.equals(str)) {
            suff = str;
            updated = true;
            return true;
        }
        return false;
    }

    bool setValue(const String &str) {
        if (!value.equals(str)) {
            value = str;
            updated = true;
            return true;
        }
        return false;
    }



    void draw(Display *obj, uint8_t line) {
    }

    void draw(Display *obj) {
        auto type = position.type;
        switch (type) {
            case POS_AUTO: {
                D_LOG("AUTO %s '%s%s'\r\n", key.c_str(), descr.c_str(), value.c_str());
                obj->setFont(pref_fnt);
                obj->print(pref.c_str());

                obj->setFont(value_fnt);
                obj->println(value.c_str(), false);

                obj->setFont(suff_fnt);
                obj->print(suff.c_str());
            }
            case POS_ABSOLUTE: {
                auto pos = position.abs;
                D_LOG("ABS(%d, %d) %s %s'\r\n", pos.x, pos.y, key.c_str(), value.c_str());
                obj->draw(pos, value);
            }
            case POS_RELATIVE: {
                auto pos = position.rel;
                D_LOG("REL(%2.2f, %2.2f) %s %s'\r\n", pos.x, pos.y, key.c_str(), value.c_str());
                obj->draw(pos, value);
            }
            case POS_TEXT: {
                auto pos = position.text;
                D_LOG("TXT(%d, %d) %s %s'\r\n", pos.col, pos.row, key.c_str(), value.c_str());
                obj->draw(pos, value);
            }
            default:
                D_LOG("unhadled: %d", type);
        }
    }
};

class ParamCollection {
    std::vector<Param> _item;

   public:
    void load() {
        for (std::list<IoTItem*>::iterator it = IoTItems.begin(); it != IoTItems.end(); ++it) {
            if ((*it)->getSubtype() == "" || (*it)->getSubtype() == "U8g2lib") continue;

            auto entry = find((*it)->getID());
            if (!entry) {
                _item.push_back({(*it)->getID(), (*it)->getID() + ": ", (*it)->getValue(), "", "", "", ""});
            } else {
                entry->setValue((*it)->getValue());
                if (entry->pref == "")
                    entry->setPref((*it)->getID() + ": ");
            }
        }
    }

    void loadExtParamData(String parameters) {
        String id = "";
        jsonRead(parameters, "id", id, false);
        if (id != "") {
            String pref = "";
            String suff = "";
            String pref_fnt = "";
            String suff_fnt = "";
            String value_fnt = "";
            String gliphs = "";

            bool hasExtParam = false;
            
            hasExtParam = hasExtParam + jsonRead(parameters, "pref", pref, false);
            hasExtParam = hasExtParam + jsonRead(parameters, "suff", suff, false);
            hasExtParam = hasExtParam + jsonRead(parameters, "pref_fnt", pref_fnt, false);
            hasExtParam = hasExtParam + jsonRead(parameters, "suff_fnt", suff_fnt, false);
            hasExtParam = hasExtParam + jsonRead(parameters, "value_fnt", value_fnt, false);
            hasExtParam = hasExtParam + jsonRead(parameters, "gliphs", gliphs, false);

            if (hasExtParam) {
                _item.push_back({id, pref, "", suff, pref_fnt, value_fnt, suff_fnt, gliphs});
            }
        }
    }

    Param *find(const String &key) {
        return find(key.c_str());
    }

    Param *find(const char *key) {
        Param *res = nullptr;
        for (size_t i = 0; i < _item.size(); i++) {
            if (_item.at(i).key.equalsIgnoreCase(key)) {
                res = &_item.at(i);
                break;
            }
        }
        return res;
    }

    Param *get(int n) {
        return &_item.at(n);
    }

    size_t count() {
        return _item.size();
    }

    // n - номер по порядку параметра
    Param *getValid(int n) {
        for (size_t i = 0; i < _item.size(); i++)
            if (_item.at(i).isValid())
                if (!(n--)) return &_item.at(i);
        return nullptr;
    }

    size_t getVaildCount() {
        size_t res = 0;
        for (auto entry : _item) res += entry.isValid();
        return res;
    }

    size_t max_group() {
        size_t res = 0;
        for (auto entry : _item)
            if (res < entry.group) res = entry.group;
        return res;
    }
};