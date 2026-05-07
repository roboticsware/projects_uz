---
title: "LED Firefly"
description: "Make a Raspberry Pi Pico blink like a firefly and learn about circuits!"
difficulty: "Level 1"
technology: ["Python"]
hardware: ["Raspberry Pi", "Electronic components"]
---

# What you will make

In this project, you will use a Raspberry Pi Pico to make an LED firefly that flashes in a particular pattern, just like fireflies in nature.

::ProjectAlert{type="warning"}
# Flashing light warning
This project uses **blinking lights**. A very small percentage of people may experience a seizure when exposed to certain visual images. If you feel unwell, immediately stop working.
::

---

## Set up your hardware

To complete this project, you will need to gather your components.

::ProjectTask
Gather 1x Yellow LED, 1x 100Ω resistor, and 2x jumper wires.
::

::ProjectTask
Plug your Raspberry Pi Pico into your computer using a USB cable.
::

::ProjectAlert{type="info"}
# Hardware Tip
A **microcontroller** is a tiny computing device that can run code and interact with electronics. The Raspberry Pi Pico is perfect for beginners!
::

---

## Light the firefly

Now it's time to connect the LED to your Pico.

1. Connect the **long leg** of the LED to GPIO pin 15.
2. Connect the **short leg** to a resistor, then to a GND pin.

::ProjectTask
Verify that your circuit matches the diagram below (imagine a diagram here!).
::

---

## Make your firefly blink

Open Thonny and write the following Python code:

```python
from machine import Pin
import time

led = Pin(15, Pin.OUT)

while True:
    led.toggle()
    time.sleep(0.5)
```

::ProjectAlert{type="success"}
# Challenge!
Can you change the `time.sleep` value to make the firefly blink faster or slower?
::

---

## Quick quiz

Before you finish, let's test your knowledge!

::QuizBox
---
question: "Which component limits the electrical current to protect the LED?"
options: ["Resistor", "Battery", "Switch"]
answer: "Resistor"
---
::

Awesome job! You've created your first interactive hardware project.
