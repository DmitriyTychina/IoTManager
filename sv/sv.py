#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для работы с bundle.js.gz - распаковка, форматирование и обратная упаковка
"""

import gzip
import os
import shutil
import re
import jsbeautifier
import rjsmin
from pathlib import Path

def format_js(content):
    # Форматирование
    formatted = jsbeautifier.beautify(content)

    return formatted

def unpack_and_format():
    """Распаковывает bundle.js.gz и форматирует его в папку sv/"""
    input_file = 'data_svelte/build/bundle.js.gz'
    output_dir = 'sv'
    
    # Создаем выходную директорию если не существует
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print(f"📦 Распаковка {input_file}...")
        
        # Распаковываем gzip
        with gzip.open(input_file, 'rb') as f_in:
            # Декодируем контент
            content = f_in.read().decode('utf-8', errors='replace')
            
            # Форматируем контент без затрагивания строк в кавычках
            print("📝 Форматирование JavaScript кода...")
            formatted_content = format_js(content)
            
            # Записываем в файл
            output_file = os.path.join(output_dir, 'bundle.js')
            with open(output_file, 'w', encoding='utf-8') as f_out:
                f_out.write(formatted_content)
            
            print(f"✅ Успешно распаковано и отформатировано: {output_file}")
            print(f"📄 Размер исходного файла: {len(content):,} байт")
            print(f"📄 Размер отформатированного: {len(formatted_content):,} байт")
                        
            return True
            
    except FileNotFoundError:
        print(f"❌ Файл не найден: {input_file}")
        return False
    except Exception as e:
        print(f"❌ Ошибка распаковки: {e}")
        return False

def pack_and_reverse():
    """Сжимает обратно bundle.js в gzip формат"""
    input_file = 'sv/bundle.js'
    output_file = 'data_svelte/build/bundle.js.gz'
    
    # Создаем директорию если не существует
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    try:
        print(f"🗜️ Сжатие {input_file} обратно...")
        
        # Считываем файл
        with open(input_file, 'r', encoding='utf-8') as f_in:
            content = f_in.read()
        
        minified_js = rjsmin.jsmin(content, keep_bang_comments=True)
        
        # Сжимаем с gzip
        with gzip.open(output_file, 'wb') as f_out:
            f_out.write(minified_js.encode('utf-8'))
        
        print(f"✅ Успешно сжато обратно: {output_file}")
        print(f"📄 Размер сжатого файла: {len(minified_js):,} байт")
        return True
        
    except FileNotFoundError:
        print(f"❌ Файл не найден: {input_file}")
        return False
    except Exception as e:
        print(f"❌ Ошибка сжатия: {e}")
        return False

def main():
    """Главное меню управления скриптами"""
    print("🔧 Скрипт для работы с bundle.js.gz")
    print("=" * 40)
    
    print("\nВыберите действие:")
    print("1. Распаковать и отформатировать bundle.js.gz")
    print("2. Сжать обратно bundle.js")
    print("3. Выход")
        
    choice = input("Введите номер действия: ").strip()
    
    if choice == '1':
        print("\n📦 Распаковка и форматирование...")
        success = unpack_and_format()
        if success:
            print("✅ Операция завершена успешно!")
    
    elif choice == '2':
        print("\n🗜️ Сжатие обратно...")
        success = pack_and_reverse()
        if success:
            print("✅ Операция завершена успешно!")
    
    elif choice == '3':
        print("👋 До свидания!")
    
    else:
        print("❌ Неверный выбор. Попробуйте снова.")

if __name__ == "__main__":
    main()
