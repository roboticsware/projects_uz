---
title: "LED Firefly (EN)"
description: "Make a Raspberry Pi Pico blink like a firefly and learn about circuits!"
difficulty: "Level 1"
technology: ["Python"]
hardware: ["Raspberry Pi", "Electronic components"]
---

# What you will make

In this project, you will use a Raspberry Pi Pico to make an LED firefly that flashes in a particular pattern.

::ProjectAlert{type="warning"}
# Flashing light warning
This project uses **blinking lights**.
::

---

## Set up your hardware

::ProjectTask
Gather your components.
::

---

## Make your firefly blink

```python
from machine import Pin
import time

led = Pin(15, Pin.OUT)

while True:
    led.toggle()
    time.sleep(0.5)
```

Awesome job!
