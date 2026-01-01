#!/bin/bash

# Get the local IP address for the primary Ethernet interface (en0)
local_ip=$(ipconfig getifaddr en0)

# If the above command fails, try getting the Wi-Fi IP address (en1)
if [ -z "$local_ip" ]; then
    local_ip=$(ipconfig getifaddr en1)
fi

# If that also fails, try wlan0 (another common Wi-Fi interface name)
if [ -z "$local_ip" ]; then
    local_ip=$(ipconfig getifaddr wlan0)
fi

# Check if we successfully retrieved an IP address
if [ -n "$local_ip" ]; then
    # Construct the Hugo server command with the obtained IP address
    hugo server --renderToMemory --logLevel info --printPathWarnings --bind "$local_ip" --baseURL "http://$local_ip/"
else
    echo "Error: Could not determine the local IP address."
    exit 1
fi
