---
title: "LED Svetlyachok"
description: "Raspberry Pi Pico-ni svetlyachok kabi miltillashga majbur qiling va sxemalar haqida bilib oling!"
difficulty: "1-daraja"
technology: ["Python"]
hardware: ["Raspberry Pi", "Elektron komponentlar"]
---

# Siz nima qilasiz

Ushbu loyihada siz Raspberry Pi Pico-dan foydalanib, tabiatdagi svetlyachoklar kabi ma'lum bir tartibda miltillovchi LED svetlyachokni yasaysiz.

::ProjectExpand{title="Miltillovchi chiroq haqida ogohlantirish" icon="warning"}
Ushbu loyihada **miltillovchi chiroqlar** ishlatiladi. Agar o'zingizni yomon his qilsangiz, darhol ishni to'xtating. 
Miltillovchi chiroqlar ba'zi odamlarda noqulaylik yoki boshqa sog'liq muammolarini keltirib chiqarishi mumkin.
::

---

## Uskunangizni sozlang

Loyihani yakunlash uchun sizga kerakli komponentlarni to'plashingiz kerak.

::ProjectTask
1 ta sariq LED, 1 ta 100Ω rezistor va 2 ta simni (jumper wires) to'plang.
::

::ProjectTask
Raspberry Pi Pico-ni USB kabeli orqali kompyuteringizga ulang.
::

::ProjectAlert{type="info"}
# Uskuna bo'yicha maslahat
**Mikrokontroller** - bu kodni bajaradigan va elektronika bilan aloqa qiladigan kichik hisoblash qurilmasi. Raspberry Pi Pico yangi o'rganuvchilar uchun juda mos keladi!
::

---

## Svetlyachokni yoqish

Endi LED-ni Pico-ga ulash vaqti keldi.

1. LED-ning **uzun oyog'ini** GPIO 15 piniga ulang.
2. **Qisqa oyog'ini** rezistorga, so'ngra GND piniga ulang.

::ProjectTask
Sizning sxemangiz quyidagi diagrammaga mos kelishini tekshiring.
::

---

## Svetlyachokni miltillatish

Thonny-ni oching va quyidagi Python kodini yozing:

```python
from machine import Pin
import time

led = Pin(15, Pin.OUT)

while True:
    led.toggle()
    time.sleep(0.5)
```

::ProjectAlert{type="success"}
# Vazifa!
Svetlyachok tezroq yoki sekinroq miltillashi uchun `time.sleep` qiymatini o'zgartira olasizmi?
::

---

## Tezkor viktorina

Tugatishdan oldin, bilimingizni tekshirib ko'raylik!

::QuizBox
---
question: "Qaysi komponent LED-ni himoya qilish uchun elektr tokini cheklaydi?"
options: ["Rezistor", "Batareya", "Kalit (Switch)"]
answer: "Rezistor"
---
::

Ajoyib ish! Siz o'zingizning birinchi interaktiv elektron loyihangizni yaratdingiz. 🥳
