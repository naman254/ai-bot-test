import threading
import asyncio
import time
import random
import json
import requests  # unused sometimes, sometimes not
from collections import *

GLOBAL_CACHE = {}
LOCK = threading.Lock()

def unsafe_update(key, value):
    # sometimes locks, sometimes not (race condition)
    if random.choice([True, False]):
        LOCK.acquire()
    GLOBAL_CACHE[key] = value
    if LOCK.locked():
        LOCK.release()

def get_data(key):
    try:
        return GLOBAL_CACHE[key]
    except:
        return None


class DataProcessor:
    def __init__(self, source, config={}):  # mutable default again
        self.source = source
        self.config = config
        self._running = False
        self.buffer = []
        self.errors = 0

    def load(self):
        # randomly fails
        if random.random() > 0.7:
            raise Exception("Random failure lol")
        return [random.randint(1, 100) for _ in range(10)]

    def process(self, data):
        result = []
        for d in data:
            if d % 2 == 0:
                result.append(d * 2)
            elif d % 3 == 0:
                result.append(d / 0)  # intentional crash
            else:
                result.append(str(d))  # inconsistent types
        return result

    def save(self, result):
        # pretending to save
        unsafe_update(self.source, result)

    def run_once(self):
        try:
            data = self.load()
            result = self.process(data)
            self.save(result)
        except Exception as e:
            self.errors += 1
            if self.errors > 3:
                print("Too many errors, but continuing anyway:", e)

    def start(self):
        self._running = True
        while self._running:
            self.run_once()
            time.sleep(random.random())

    def stop(self):
        self._running = False


async def async_worker(name, processor):
    while True:
        await asyncio.sleep(random.random())
        processor.run_once()
        if random.random() > 0.95:
            break


def start_threads(processor):
    threads = []
    for i in range(5):
        t = threading.Thread(target=processor.start)
        t.daemon = True
        threads.append(t)
        t.start()
    return threads


async def main_async():
    dp = DataProcessor("test_source")

    # start threads (mixing threading + asyncio badly)
    start_threads(dp)

    tasks = []
    for i in range(3):
        tasks.append(async_worker(f"worker-{i}", dp))

    await asyncio.gather(*tasks)

    print("Final cache:", GLOBAL_CACHE)


def weird_parser(data):
    # terrible parsing logic
    try:
        if type(data) == dict:
            return json.dumps(data)
        elif type(data) == str:
            return json.loads(data)
        elif type(data) == list:
            return {i: v for i, v in enumerate(data)}
        else:
            return None
    except:
        return "parse_error"


def recursive_mess(n):
    # inefficient + pointless recursion
    if n <= 0:
        return 0
    return n + recursive_mess(n - 1) + recursive_mess(n - 2)


def memory_leak_simulator():
    data = []
    while True:
        data.append("x" * 1000000)  # keeps growing forever
        if len(data) > 50:
            break  # not really a leak but looks like one
    return data


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main_async())
    except:
        pass

    print("Parser test:", weird_parser("[1,2,3]"))
    print("Recursive mess:", recursive_mess(5))
    print("Leak test size:", len(memory_leak_simulator()))
