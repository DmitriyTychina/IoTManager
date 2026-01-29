
#include "ModbusEC.h"

#define COUNT_BIT_AVAIL 5
#define COUNT_BIT_AVAIL_46F 4

ModbusMaster::ModbusMaster(void)
{
  _idle = 0;
  _preTransmission = 0;
  _postTransmission = 0;
}

/**
Initialize class object.

Assigns the Modbus slave ID and serial port.
Call once class has been instantiated, typically within setup().

@param slave Modbus slave ID (1..255)
@param &serial reference to serial port object (Serial, Serial1, ... Serial3)
@ingroup setup
*/
void ModbusMaster::begin(uint8_t slave, Stream *serial)
{
  //  txBuffer = (uint16_t*) calloc(ku8MaxBufferSize, sizeof(uint16_t));
  _u8MBSlave = slave;
  _serial = serial;
  _u8TransmitBufferIndex = 0;
  u16TransmitBufferLength = 0;

#if __MODBUSMASTER_DEBUG__
  pinMode(__MODBUSMASTER_DEBUG_PIN_A__, OUTPUT);
  pinMode(__MODBUSMASTER_DEBUG_PIN_B__, OUTPUT);
#endif
}

void ModbusMaster::beginTransmission(uint16_t u16Address)
{
  _u16WriteAddress = u16Address;
  _u8TransmitBufferIndex = 0;
  u16TransmitBufferLength = 0;
}

// eliminate this function in favor of using existing MB request functions
uint8_t ModbusMaster::requestFrom(uint16_t address, uint16_t quantity)
{
  uint8_t read;
  // clamp to buffer length
  if (quantity > ku8MaxBufferSize)
  {
    quantity = ku8MaxBufferSize;
  }
  // set rx buffer iterator vars
  _u8ResponseBufferIndex = 0;
  _u8ResponseBufferLength = read;

  return read;
}

void ModbusMaster::sendBit(bool data)
{
  uint8_t txBitIndex = u16TransmitBufferLength % 16;
  if ((u16TransmitBufferLength >> 4) < ku8MaxBufferSize)
  {
    if (0 == txBitIndex)
    {
      _u16TransmitBuffer[_u8TransmitBufferIndex] = 0;
    }
    bitWrite(_u16TransmitBuffer[_u8TransmitBufferIndex], txBitIndex, data);
    u16TransmitBufferLength++;
    _u8TransmitBufferIndex = u16TransmitBufferLength >> 4;
  }
}

void ModbusMaster::send(uint16_t data)
{
  if (_u8TransmitBufferIndex < ku8MaxBufferSize)
  {
    _u16TransmitBuffer[_u8TransmitBufferIndex++] = data;
    u16TransmitBufferLength = _u8TransmitBufferIndex << 4;
  }
}

void ModbusMaster::send(uint32_t data)
{
  send(lowWord(data));
  send(highWord(data));
}

void ModbusMaster::send(uint8_t data)
{
  send(word(data));
}

uint8_t ModbusMaster::available(void)
{
  return _u8ResponseBufferLength - _u8ResponseBufferIndex;
}

uint16_t ModbusMaster::receive(void)
{
  if (_u8ResponseBufferIndex < _u8ResponseBufferLength)
  {
    return _u16ResponseBuffer[_u8ResponseBufferIndex++];
  }
  else
  {
    return 0xFFFF;
  }
}

/**
Set idle time callback function (cooperative multitasking).

This function gets called in the idle time between transmission of data
and response from slave. Do not call functions that read from the serial
buffer that is used by ModbusMaster. Use of i2c/TWI, 1-Wire, other
serial ports, etc. is permitted within callback function.

@see ModbusMaster::ModbusMasterTransaction()
*/
void ModbusMaster::idle(void (*idle)())
{
  _idle = idle;
}

/**
Set pre-transmission callback function.

This function gets called just before a Modbus message is sent over serial.
Typical usage of this callback is to enable an RS485 transceiver's
Driver Enable pin, and optionally disable its Receiver Enable pin.

@see ModbusMaster::ModbusMasterTransaction()
@see ModbusMaster::postTransmission()
*/
void ModbusMaster::preTransmission(void (*preTransmission)())
{
  _preTransmission = preTransmission;
}

/**
Set post-transmission callback function.

This function gets called after a Modbus message has finished sending
(i.e. after all data has been physically transmitted onto the serial
bus).

Typical usage of this callback is to enable an RS485 transceiver's
Receiver Enable pin, and disable its Driver Enable pin.

@see ModbusMaster::ModbusMasterTransaction()
@see ModbusMaster::preTransmission()
*/
void ModbusMaster::postTransmission(void (*postTransmission)())
{
  _postTransmission = postTransmission;
}

/**
Retrieve data from response buffer.

@see ModbusMaster::clearResponseBuffer()
@param u8Index index of response buffer array (0x00..0x3F)
@return value in position u8Index of response buffer (0x0000..0xFFFF)
@ingroup buffer
*/
uint16_t ModbusMaster::getResponseBuffer(uint8_t u8Index)
{
  if (u8Index < ku8MaxBufferSize)
  {
    return _u16ResponseBuffer[u8Index];
  }
  else
  {
    return 0xFFFF;
  }
}

/**
Clear Modbus response buffer.

@see ModbusMaster::getResponseBuffer(uint8_t u8Index)
@ingroup buffer
*/
void ModbusMaster::clearResponseBuffer()
{
  uint8_t i;

  for (i = 0; i < ku8MaxBufferSize; i++)
  {
    _u16ResponseBuffer[i] = 0;
  }
}

/**
Place data in transmit buffer.

@see ModbusMaster::clearTransmitBuffer()
@param u8Index index of transmit buffer array (0x00..0x3F)
@param u16Value value to place in position u8Index of transmit buffer (0x0000..0xFFFF)
@return 0 on success; exception number on failure
@ingroup buffer
*/
uint8_t ModbusMaster::setTransmitBuffer(uint8_t u8Index, uint16_t u16Value)
{
  if (u8Index < ku8MaxBufferSize)
  {
    _u16TransmitBuffer[u8Index] = u16Value;
    return ku8MBSuccess;
  }
  else
  {
    return ku8MBIllegalDataAddress;
  }
}

/**
Clear Modbus transmit buffer.

@see ModbusMaster::setTransmitBuffer(uint8_t u8Index, uint16_t u16Value)
@ingroup buffer
*/
void ModbusMaster::clearTransmitBuffer()
{
  uint8_t i;

  for (i = 0; i < ku8MaxBufferSize; i++)
  {
    _u16TransmitBuffer[i] = 0;
  }
}

/**
Modbus function 0x03 Read Holding Registers.

This function code is used to read the contents of a contiguous block of
holding registers in a remote device. The request specifies the starting
register address and the number of registers. Registers are addressed
starting at zero.

The register data in the response buffer is packed as one word per
register.

@param u16ReadAddress address of the first holding register (0x0000..0xFFFF)
@param u16ReadQty quantity of holding registers to read (1..125, enforced by remote device)
@return 0 on success; exception number on failure
@ingroup register
*/
uint8_t ModbusMaster::readHoldingRegisters(uint16_t u16ReadAddress,
                                           uint16_t u16ReadQty)
{
  _u16ReadAddress = u16ReadAddress;
  _u16ReadQty = u16ReadQty;
  return ModbusMasterTransaction(ku8MBReadHoldingRegisters);
}

/**
Modbus function 0x06 Write Single Register.

This function code is used to write a single holding register in a
remote device. The request specifies the address of the register to be
written. Registers are addressed starting at zero.

@param u16WriteAddress address of the holding register (0x0000..0xFFFF)
@param u16WriteValue value to be written to holding register (0x0000..0xFFFF)
@return 0 on success; exception number on failure
@ingroup register
*/
uint8_t ModbusMaster::writeSingleRegister(uint16_t u16WriteAddress,
                                          uint16_t u16WriteValue)
{
  _u16WriteAddress = u16WriteAddress;
  _u16WriteQty = 0;
  _u16TransmitBuffer[0] = u16WriteValue;
  return ModbusMasterTransaction(ku8MBWriteSingleRegister);
}

/**
Modbus function 0x10 Write Multiple Registers.

This function code is used to write a block of contiguous registers (1
to 123 registers) in a remote device.

The requested written values are specified in the transmit buffer. Data
is packed as one word per register.

@param u16WriteAddress address of the holding register (0x0000..0xFFFF)
@param u16WriteQty quantity of holding registers to write (1..123, enforced by remote device)
@return 0 on success; exception number on failure
@ingroup register
*/
uint8_t ModbusMaster::writeMultipleRegisters(uint16_t u16WriteAddress,
                                             uint16_t u16WriteQty)
{
  _u16WriteAddress = u16WriteAddress;
  _u16WriteQty = u16WriteQty;
  return ModbusMasterTransaction(ku8MBWriteMultipleRegisters);
}

// new version based on Wire.h
uint8_t ModbusMaster::writeMultipleRegisters()
{
  _u16WriteQty = _u8TransmitBufferIndex;
  return ModbusMasterTransaction(ku8MBWriteMultipleRegisters);
}

uint8_t ModbusMaster::readAddresEctoControl()
{
  _u16ReadAddress = 0x00;
  _u16ReadQty = 1;
  ModbusMasterTransaction(ku8MBProgRead46);
  return getResponseBuffer(0x00);
}
uint8_t ModbusMaster::writeAddresEctoControl(uint8_t addr)
{
  _u16WriteAddress = 0x00;
  _u16WriteQty = 1;
  _u16TransmitBuffer[0] = (uint16_t)addr;
  return ModbusMasterTransaction(ku8MBProgWrite47);
}

/* _____PRIVATE FUNCTIONS____________________________________________________ */
/**
Modbus transaction engine.
Sequence:
  - assemble Modbus Request Application Data Unit (ADU),
    based on particular function called
  - transmit request over selected serial port
  - wait for/retrieve response
  - evaluate/disassemble response
  - return status (success/exception)

@param u8MBFunction Modbus function (0x01..0xFF)
@return 0 on success; exception number on failure
*/
uint8_t ModbusMaster::ModbusMasterTransaction(uint8_t u8MBFunction)
{
  uint8_t u8ModbusADU[24];
  uint8_t u8ModbusADUSize = 0;
  uint8_t i, u8Qty;
  uint16_t u16CRC;
  uint32_t u32StartTime;
  uint8_t u8BytesLeft = 8;
  uint8_t u8MBStatus = ku8MBSuccess;

  // assemble Modbus Request Application Data Unit
  if (u8MBFunction == ku8MBProgRead46 || u8MBFunction == ku8MBProgWrite47)
  {
    u8ModbusADU[u8ModbusADUSize++] = 0x00;
    u8ModbusADU[u8ModbusADUSize++] = u8MBFunction;
  }
  else
  {
    u8ModbusADU[u8ModbusADUSize++] = _u8MBSlave;
    u8ModbusADU[u8ModbusADUSize++] = u8MBFunction;
  }

  switch (u8MBFunction)
  {
  case ku8MBReadHoldingRegisters:
    u8ModbusADU[u8ModbusADUSize++] = highByte(_u16ReadAddress);
    u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16ReadAddress);
    u8ModbusADU[u8ModbusADUSize++] = highByte(_u16ReadQty);
    u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16ReadQty);
    break;
  }

  switch (u8MBFunction)
  {
  case ku8MBWriteMultipleRegisters:
    u8ModbusADU[u8ModbusADUSize++] = highByte(_u16WriteAddress);
    u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16WriteAddress);
    break;
  }

  switch (u8MBFunction)
  {
  case ku8MBWriteMultipleRegisters:
    u8ModbusADU[u8ModbusADUSize++] = highByte(_u16WriteQty);
    u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16WriteQty);
    u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16WriteQty << 1);

    for (i = 0; i < lowByte(_u16WriteQty); i++)
    {
      u8ModbusADU[u8ModbusADUSize++] = highByte(_u16TransmitBuffer[i]);
      u8ModbusADU[u8ModbusADUSize++] = lowByte(_u16TransmitBuffer[i]);
    }
    break;
  }

  // append CRC
  u16CRC = 0xFFFF;
  for (i = 0; i < u8ModbusADUSize; i++)
  {
    u16CRC = crc16_update(u16CRC, u8ModbusADU[i]);
  }
  // if (u8MBFunction == ku8MBProgRead46 || u8MBFunction == ku8MBProgWrite47)
  // {
  //   u8ModbusADU[u8ModbusADUSize++] = highByte(u16CRC);
  //   u8ModbusADU[u8ModbusADUSize++] = lowByte(u16CRC);
  // }
  // else
  // {
  u8ModbusADU[u8ModbusADUSize++] = lowByte(u16CRC);
  u8ModbusADU[u8ModbusADUSize++] = highByte(u16CRC);
  // }

  u8ModbusADU[u8ModbusADUSize] = 0;

  // flush receive buffer before transmitting request
  while (_serial->read() != -1)
    ;

  // transmit request
  if (_preTransmission)
  {
    _preTransmission();
  }
  for (i = 0; i < u8ModbusADUSize; i++)
  {
    _serial->write(u8ModbusADU[i]);
  }

  u8ModbusADUSize = 0;
  _serial->flush(); // flush transmit buffer
  if (_postTransmission)
  {
    _postTransmission();
  }

  // loop until we run out of time or bytes, or an error occurs
  u32StartTime = millis();
  while (u8BytesLeft && !u8MBStatus)
  {
    if (_serial->available())
    {
#if __MODBUSMASTER_DEBUG__
      digitalWrite(__MODBUSMASTER_DEBUG_PIN_A__, true);
#endif
      uint8_t req = _serial->read();
      u8ModbusADU[u8ModbusADUSize++] = req;
      Serial.print(req, HEX);
      u8BytesLeft--;
#if __MODBUSMASTER_DEBUG__
      digitalWrite(__MODBUSMASTER_DEBUG_PIN_A__, false);
#endif
    }
    else
    {
#if __MODBUSMASTER_DEBUG__
      digitalWrite(__MODBUSMASTER_DEBUG_PIN_B__, true);
#endif
      if (_idle)
      {
        _idle();
      }
#if __MODBUSMASTER_DEBUG__
      digitalWrite(__MODBUSMASTER_DEBUG_PIN_B__, false);
#endif
    }

    // evaluate slave ID, function code once enough bytes have been read
    uint8_t count;
    if (u8MBFunction == ku8MBProgRead46 || u8MBFunction == ku8MBProgWrite47)
      count = COUNT_BIT_AVAIL_46F;
    else
      count = COUNT_BIT_AVAIL;

    if (u8ModbusADUSize == count)
    {
      if (u8MBFunction != ku8MBProgRead46 && u8MBFunction != ku8MBProgWrite47)
      {
        // verify response is for correct Modbus slave
        if (u8ModbusADU[0] != _u8MBSlave)
        {
          // Serial.print(u8ModbusADU[0], HEX);
          // Serial.print(" != ");
          // Serial.println(_u8MBSlave, HEX);

          u8MBStatus = ku8MBInvalidSlaveID;
          break;
        }

        // verify response is for correct Modbus function code (mask exception bit 7)
        if ((u8ModbusADU[1] & 0x7F) != u8MBFunction)
        {
          u8MBStatus = ku8MBInvalidFunction;
          break;
        }
      }
      // check whether Modbus exception occurred; return Modbus Exception Code
      if (bitRead(u8ModbusADU[1], 7))
      {
        u8MBStatus = u8ModbusADU[2];
        break;
      }

      // evaluate returned Modbus function code
      switch (u8ModbusADU[1])
      {
      case ku8MBReadHoldingRegisters:
        u8BytesLeft = u8ModbusADU[2];
        break;

      case ku8MBWriteMultipleRegisters:
        u8BytesLeft = 3;
        break;

      case ku8MBProgRead46:
        u8BytesLeft = 1;
        break;

      case ku8MBProgWrite47:
        u8BytesLeft = 1;
        break;

      default:
      }
    }
    if ((millis() - u32StartTime) > ku16MBResponseTimeout)
    {
      u8MBStatus = ku8MBResponseTimedOut;
    }
  }

  if (u8MBFunction != ku8MBProgRead46 && u8MBFunction != ku8MBProgWrite47)
  {
    // verify response is large enough to inspect further
    if (!u8MBStatus && u8ModbusADUSize >= COUNT_BIT_AVAIL)
    {
      // calculate CRC
      u16CRC = 0xFFFF;
      for (i = 0; i < (u8ModbusADUSize - 2); i++)
      {
        u16CRC = crc16_update(u16CRC, u8ModbusADU[i]);
      }

      // verify CRC
      if (!u8MBStatus && (lowByte(u16CRC) != u8ModbusADU[u8ModbusADUSize - 2] ||
                          highByte(u16CRC) != u8ModbusADU[u8ModbusADUSize - 1]))
      {
        u8MBStatus = ku8MBInvalidCRC;
      }
    }
  }
  // disassemble ADU into words
  if (!u8MBStatus)
  {
    // evaluate returned Modbus function code
    switch (u8ModbusADU[1])
    {
    case ku8MBReadHoldingRegisters:
      // load bytes into word; response bytes are ordered H, L, H, L, ...
      for (i = 0; i < (u8ModbusADU[2] >> 1); i++)
      {
        if (i < ku8MaxBufferSize)
        {
          _u16ResponseBuffer[i] = word(u8ModbusADU[2 * i + 3], u8ModbusADU[2 * i + 4]);
        }

        _u8ResponseBufferLength = i;
      }
      break;
    case ku8MBProgRead46:
      Serial.print("ku8MBProgRead46");
      for (i = 0; i < (u8ModbusADUSize); i++)
      {
        Serial.println(u8ModbusADU[i], HEX);
      }

      _u16ResponseBuffer[0] = (uint16_t)u8ModbusADU[2];
      _u8ResponseBufferLength = 1;
      break;
    }
  }

  _u8TransmitBufferIndex = 0;
  u16TransmitBufferLength = 0;
  _u8ResponseBufferIndex = 0;
  return u8MBStatus;
}
