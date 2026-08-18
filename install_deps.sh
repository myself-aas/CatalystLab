#!/bin/bash
apt-get update
apt-get install -y python3-pip
cd python-engines
pip3 install -r requirements.txt --break-system-packages
