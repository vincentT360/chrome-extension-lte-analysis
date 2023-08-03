# SPICE: Software-based Parameter Inference Chrome Extension

### Overview

A detailed report can be found here: https://drive.google.com/file/d/1sUYixy9_RAzRpzkFlhha7EIUJO9ffkxh/view

We propose Software-based Parameter Inference Chrome Extension (SPICE), an application-level Chrome extension
developed for Chromium-based browsers on both phones and computers.

This project has three primary features:
1. Capturing web requests
2. Inferring scheduling-related mobile network parameters
3. Performing an optimization demonstration using the discovered parameters

SPICE first intercepts and logs web requests that pass through the client’s browser using a chrome web extension. Secondly, SPICE will send different configurations of dummy packets to infer multiple mobile network parameters via a special server. Lastly, using these inferred parameters, SPICE attempts to explore the potential of latency optimization for cellular networks.

This work is based on the LRP project [Tan et al. 2021].

Our results show proper logging of web requests, accurate estimation of mobile network parameters when compared to the ground truth, and successful latency optimization in certain test cases.

### Code and Deployment

The front-end chrome extension can be loaded by adding it on as a custom chrome extension in developer mode. Steps can be found here: https://support.google.com/chrome/a/answer/2714278?hl=en

The backend web socket server needs to be placed on a host (e.g linux host).

Code:

For the server: backend-ws-server

For the extension: Remaining files and folders
