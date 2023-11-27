#include "Global.h"
#include "classes/IoTItem.h"

//дочь         -        родитель
class Variable : public IoTItem {
   private:
   public:
    Variable(String parameters) : IoTItem(parameters) {
    }

    void doByInterval() {
    }
#if defined(Dev_GetSize) && Dev_GetSize == 1
    int32_t getSize(){ return sizeof(*this); }
#endif
};

void* getAPI_Variable(String subtype, String param) {
    if (subtype == F("Variable")) {
        return new Variable(param);
    } else {
        return nullptr;
    }
}
