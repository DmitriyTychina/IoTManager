#include "Global.h"
#include "classes/IoTItem.h"
#include <U8g2lib.h>
#include "DisplayTypes.h"

#define STRHELPER(x) #x
#define TO_STRING_AUX(...) "" #__VA_ARGS__
#define TO_STRING(x) TO_STRING_AUX(x)


// дополненный список параметров для вывода, который синхронизирован со списком значений IoTM
ParamCollection *extParams{nullptr};

// класс одного главного экземпляра экрана для выделения памяти только когда потребуется экран
class DisplayImplementation {
  private:
    unsigned long _lastPageChange{0};
    bool _pageChanged{false};
    // uint8_t _max_descr_width{0};
    // typedef std::vector<Param *> Line;
    // текущая
    size_t _page_n{0};
    // struct Page {
    //     std::vector<Line *> line;
    // };

    uint8_t _n{0}; // последний отображенный

    DisplayHardwareSettings *_context{nullptr};
    Display *_display{nullptr};

  public:
    DisplayImplementation(DisplayHardwareSettings *context = nullptr,
                           Display *display = nullptr)
        : _context(context), _display(display) {

    }
    
    ~DisplayImplementation() {
        if (_display) {
            delete _display;
            _display = nullptr;
        }
        if (_context) {
            delete _context;
            _context = nullptr;
        }
        if (extParams) {
            delete extParams;
            extParams = nullptr;
        }
    }
    
    std::vector<DisplayPage> page;

    void nextPage() {
        _n = _n + 1;
        if (_n == page.size()) _n = _n - 1;
        _pageChanged = true;
    }

    void prevPage() {
        if (_n > 0) _n = _n - 1;
        _pageChanged = true;
    }

    void rotPage() {
        _n = _n + 1;
        if (_n == page.size()) _n = 0;
        _pageChanged = true;
    }

    void gotoPage(uint8_t num) {
        _n = num;
        if (num < 0) _n = 0;
        if (num >= page.size()) _n = page.size() - 1;
        _pageChanged = true;
    }

    void setAutoPage(bool isAuto) {
        if (_context) _context->autoPage = isAuto;
        _pageChanged = true;
    }

    uint8_t calcPageCount(ParamCollection *param, uint8_t linesPerPage) {
        size_t res = 0;
        size_t totalLines = param->count();
        if (totalLines && linesPerPage) {
            res = totalLines / linesPerPage;
            if (totalLines % linesPerPage) res++;
        }
        return res;
    }

    // uint8_t getPageCount() {
    //     return isAutoPage() ? calcPageCount(_param, _display->getLines()) : getPageCount();
    // }

    // выводит на страницу параметры начиная c [n]
    // возвращает [n] последнего уместившегося
    uint8_t draw(Display *display, ParamCollection *param, uint8_t n) {
        // Очищает буфер (не экран, а внутреннее представление) для последущего заполнения
        display->startRefresh();
        size_t i = 0;
        // вот тут лог ошибка
        for (i = n; i < param->count(); i++) {
            auto cursor = display->getCursor();
            auto entry = param->get(i);
            auto len = entry->value.length() + entry->pref.length() + entry->suff.length() ;
            if (cursor->isEndOfLine(len)) cursor->lineFeed();
            
            printParam(display, entry, _context->font);
            
            if (cursor->isEndOfPage(0)) break;
        }
        // Отправит готовый буфер страницы на дисплей
        display->endRefresh();
        return i;
    }

    String slice(const String &str, size_t index, char delim) {
        size_t cnt = 0;
        int subIndex[] = {0, -1};
        size_t maxIndex = str.length() - 1;

        for (size_t i = 0; (i <= maxIndex) && (cnt <= index); i++) {
            if ((str.charAt(i) == delim) || (i == maxIndex)) {
                cnt++;
                subIndex[0] = subIndex[1] + 1;
                subIndex[1] = (i == maxIndex) ? i + 1 : i;
            }
        }
        return cnt > index ? str.substring(subIndex[0], subIndex[1]) : emptyString;
    }

    void printParam(Display *display, Param *param, const String &parentFont) {
        if (!param->pref.isEmpty()) {
            display->setFont(param->pref_fnt.isEmpty() ? parentFont : param->pref_fnt);
            display->print(param->pref);
        }

        if (!param->value.isEmpty()) {
            display->setFont(param->value_fnt.isEmpty() ? parentFont : param->value_fnt);
            if (!param->gliphs.isEmpty() && isDigitStr(param->value)) {
                int glyphIndex = param->value.toInt();
                display->print(getUtf8CharByIndex(param->gliphs, glyphIndex));
            } else display->print(param->value);
        }
        
        if (!param->suff.isEmpty()) {
            display->setFont(param->suff_fnt.isEmpty() ? parentFont : param->suff_fnt);
            display->print(param->suff);
        }
    }

    void showXXX(Display *display, ParamCollection *param, uint8_t page) {
        size_t linesPerPage = display->getLines();
        size_t line_first = _page_n * linesPerPage;
        size_t line_last = line_first + linesPerPage - 1;

        display->startRefresh();

        size_t lineOfPage = 0;
        for (size_t n = line_first; n <= line_last; n++) {
            auto entry = param->get(n);
            if (entry) {
                entry->draw(_display, lineOfPage);
                lineOfPage++;
            } else {
                break;
            }
        }
        display->endRefresh();
    }

    void drawPage(Display *display, ParamCollection *params, DisplayPage *page) {
        display->setFont(page->font);
        display->initCursor();

        auto keys = page->key;
        D_LOG("page keys: %s\r\n", keys.c_str());
        size_t l = 0;
        auto line_keys = slice(keys, l, '#');
        while (!line_keys.isEmpty()) {
            if (page->valign.equalsIgnoreCase("center")) {
                display->getCursor()->moveY((display->getHeight() / 2) - display->getMaxCharHeight() / 2);
            }
            D_LOG("line keys: %s\r\n", keys.c_str());
            size_t n = 0;
            auto key = slice(line_keys, n, ',');
            while (!key.isEmpty()) {
                D_LOG("key: %s\r\n", key.c_str());
                auto entry = params->find(key.c_str());
                if (entry && entry->updated) {
                    if (n) display->print(" ");
                    printParam(display, entry, page->font);
                }
                key = slice(line_keys, ++n, ',');
            }
            display->getCursor()->lineFeed();
            line_keys = slice(keys, ++l, '#');
        }
    }

    // Режим пользовательской разбивки параметров по страницам
    void showManual(Display *display, ParamCollection *param) {
        auto page = getPage(_n);

        if (display->isNeedsRefresh() || _pageChanged) {
            D_LOG("[Display] page: %d\r\n", _n);
            display->setRotation(page->rotate);
            display->startRefresh();
            drawPage(display, param, page);
            display->endRefresh();
            _pageChanged = false;        
        }

        if (_context->autoPage && millis() >= (_lastPageChange + page->time)) {
            // Если это была последняя начинаем с начала
            if (++_n > (getPageCount() - 1)) _n = 0;
            _pageChanged = true;
            _lastPageChange = millis();
        }
    }

    // Режим авто разбивки параметров по страницам
    void showAuto(Display *display, ParamCollection *param) {
        size_t param_count = param->count();

        if (!param_count) return;

        display->setFont(_context->font);
        display->initCursor();

        size_t last_n = _n;
        if (display->isNeedsRefresh() || _pageChanged) {
            //D_LOG("n: %d/%d\r\n", _n, param_count);
            last_n = draw(display, param, _n);
        }

        if (_context->autoPage && millis() >= (_lastPageChange + _context->pageTime)) {
            _n = last_n;
            if (_n >= param_count) _n = 0;
            _pageChanged = true;
            _lastPageChange = millis();
        }
    }

    void show() {
        if (extParams && _display) {
            extParams->load();

            if (isAutoPage()) {
                showAuto(_display, extParams);
            } else {
                showManual(_display, extParams);
            }
        }
    }
    
    bool isAutoPage() {
        return !getPageCount();
    }

    uint8_t getPageCount() {
        return page.size();
    }

    DisplayPage* getPage(uint8_t index) {
        return &page.at(index);
    }
};


DisplayImplementation* displayImpl = nullptr;


class U8g2lib : public IoTItem {   
   private: 
    uint8_t _pageNum = 0;

   public:
    U8g2lib(String parameters) : IoTItem(parameters) {
        DisplayHardwareSettings *context = new DisplayHardwareSettings();
        if (!context) {
            D_LOG("[Display] disabled");
            return;
        }

        jsonRead(parameters, "update", context->update);
        jsonRead(parameters, "font", context->font);
        
        int rotate;
        jsonRead(parameters, "rotation", rotate);
        context->rotate = parse_rotation(rotate);

        jsonRead(parameters, "contrast", context->contrast);
        jsonRead(parameters, "autoPage", context->autoPage);
        jsonRead(parameters, "pageTime", context->pageTime);

        bool itsFirstDisplayInit = false;
        if (!displayImpl) {
            // Значит это первый элемент U8g2lib в конфигурации - Инициализируем дисплей
            itsFirstDisplayInit = true;
            int dc = U8X8_PIN_NONE, cs = U8X8_PIN_NONE, data = U8X8_PIN_NONE, clock = U8X8_PIN_NONE, rst = U8X8_PIN_NONE;
            jsonRead(parameters, "dc", dc);
            jsonRead(parameters, "cs", cs);
            jsonRead(parameters, "data", data);
            jsonRead(parameters, "clock", clock);
            jsonRead(parameters, "rst", rst);
            if (dc == -1) dc = U8X8_PIN_NONE;
            if (cs == -1) cs = U8X8_PIN_NONE;
            if (data == -1) data = U8X8_PIN_NONE;
            if (clock == -1) clock = U8X8_PIN_NONE;
            if (rst == -1) rst = U8X8_PIN_NONE;

            String type;
            jsonRead(parameters, "oledType", type);
            U8G2* libObj = nullptr;
            if (type.startsWith("ST")) {
                libObj = new U8G2_ST7565_ERC12864_F_4W_SW_SPI(U8G2_R0, clock, data, cs, dc, rst);
            } 
            else if (type.startsWith("SS_I2C")) {
                // libObj = new U8G2_SSD1306_128X64_VCOMH0_F_SW_I2C(U8G2_R0, clock, data, rst);
                libObj = new U8G2_SSD1306_128X32_UNIVISION_F_SW_I2C(U8G2_R0, clock, data, rst);
                
            } 
            else if (type.startsWith("SS_SPI")) {
                libObj = new U8G2_SSD1306_128X64_NONAME_F_4W_SW_SPI(U8G2_R0, clock, data, cs, dc, rst);
            } 
            else if (type.startsWith("SH")) {
                libObj = new U8G2_SH1106_128X64_NONAME_F_HW_I2C(U8G2_R0, rst, clock, data);
            }

            if (!libObj) {
                D_LOG("[Display] disabled");
                return;
            }

            Display *_display = new Display(libObj, context);
            if (!_display) {
                D_LOG("[Display] disabled");
                return;
            }

            if (!extParams) extParams = new ParamCollection();
            
            displayImpl = new DisplayImplementation(context, _display);
            if (!displayImpl) {
                D_LOG("[Display] disabled");
                return;
            }
        }

        // добавляем страницу, если указан ID для отображения
        String id2show;
        jsonRead(parameters, "id2show", id2show);
        if (!id2show.isEmpty()) {
            auto item = DisplayPage(
                id2show,
                context->pageTime,
                context->rotate,
                context->font,
                context->pageFormat,
                context->valign
            );
            _pageNum = displayImpl->page.size();
            displayImpl->page.push_back(item);
            if (!itsFirstDisplayInit) delete context; // если это не первый вызов, то контекст имеет временный характер только для создания страницы
        }
    }

    void doByInterval() {
        if (displayImpl) displayImpl->show();
    }

    IoTValue execute(String command, std::vector<IoTValue>& param) {
        if (displayImpl)
            if (command == "nextPage") {
                displayImpl->nextPage();
            } else if (command == "prevPage") {
                displayImpl->prevPage();
            } else if (command == "rotPage") {
                displayImpl->rotPage();
            } else if (command == "gotoPage") {
                if (param.size() == 1) {
                    displayImpl->gotoPage(param[0].valD);
                } else {
                    displayImpl->gotoPage(_pageNum);
                }
            } else if (command == "setAutoPage") {
                if (param.size() == 1) {
                    displayImpl->setAutoPage(param[0].valD);
                }
            }

        return {};
    }

    ~U8g2lib() {
        if (displayImpl) {
            delete displayImpl;
            displayImpl = nullptr;
        }
    };
};

void* getAPI_U8g2lib(String subtype, String param) {
    if (subtype == F("U8g2lib")) {
        //  SerialPrint("[Display]", "param1: ", param);
        return new U8g2lib(param);
    } else {
        // элемент не наш, но проверяем на налличие модификаторов, которые нужны для модуля
        // вынимаем ID элемента и значения pref и suff связанные с ним
        if (!extParams) extParams = new ParamCollection();
        extParams->loadExtParamData(param);
        return nullptr;
    }
}
