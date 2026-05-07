---
title: "반짝이는 LED 반딧불이"
description: "라즈베리 파이 피코를 사용하여 반딧불이처럼 깜빡이는 LED를 만들고 전기 회로의 기초를 배워보세요!"
difficulty: "초급"
technology: ["로봇공학"]
hardware: ["Raspberry Pi Pico"]
---

# 무엇을 만들게 되나요?

이 프로젝트에서는 라즈베리 파이 피코(Raspberry Pi Pico)를 사용하여 자연 속의 반딧불이처럼 특정 패턴으로 깜빡이는 LED 반딧불이를 만들어 봅니다.

::ProjectAlert{type="warning"}
# 광과민성 경고
이 프로젝트는 **깜빡이는 빛**을 사용합니다. 아주 적은 비율의 사람들이 특정 시각적 이미지에 노출될 때 발작을 일으킬 수 있습니다. 작업 중 몸이 불편하다면 즉시 중단하세요.
::

---

## 하드웨어 준비하기

이 프로젝트를 완료하려면 다음 부품들을 준비해야 합니다.

::ProjectTask
노란색 LED 1개, 100Ω 저항 1개, 점퍼 와이어 2개를 준비하세요.
::

::ProjectTask
USB 케이블을 사용하여 라즈베리 파이 피코를 컴퓨터에 연결하세요.
::

::ProjectAlert{type="info"}
# 하드웨어 팁
**마이크로컨트롤러**는 코드를 실행하고 전자 부품과 상호작용할 수 있는 아주 작은 컴퓨터 장치입니다. 라즈베리 파이 피코는 입문자에게 안성맞춤입니다!
::

---

## 반딧불이 조립하기

이제 LED를 피코에 연결할 차례입니다.

1. LED의 **긴 다리**를 GPIO 15번 핀에 연결합니다.
2. LED의 **짧은 다리**를 저항에 연결한 후, GND(접지) 핀에 연결합니다.

::ProjectTask
회로가 아래 다이어그램(그림이 있다고 가정해 보세요!)과 일치하는지 확인하세요.
::

---

## 반딧불이 깜빡이게 만들기

Thonny 에디터를 열고 다음 파이썬 코드를 작성하세요.

```python
from machine import Pin
import time

# LED가 연결된 핀 설정 (GPIO 15)
led = Pin(15, Pin.OUT)

while True:
    led.value(1)  # LED 켜기
    time.sleep(0.5)
    led.value(0)  # LED 끄기
    time.sleep(0.5)
```

::ProjectAlert{type="success"}
# 도전 과제!
`time.sleep` 값을 변경하여 반딧불이가 더 빠르게 또는 더 느리게 깜빡이도록 만들 수 있나요?
::

---

## 퀵 퀴즈

마치기 전에, 배운 내용을 확인해 봅시다!

::QuizBox
---
question: "Which component limits the electrical current to protect the LED?"
options: ["저항(Resistor)", "배터리(Battery)", "스위치(Switch)"]
answer: "저항(Resistor)"
---
::

잘하셨습니다! 여러분의 첫 번째 인터랙티브 하드웨어 프로젝트를 성공적으로 마쳤습니다.
