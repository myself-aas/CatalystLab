#!/bin/bash
apt-get update --fix-missing
apt-get install -y python3-pip
cd python-engines
pip3 install -r requirements.txt --break-system-packages
