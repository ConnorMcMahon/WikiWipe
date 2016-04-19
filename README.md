# WikiWipe

WikiWipe is a system developed by Connor McMahon as part of a research project for Grouplens at the University of Minnesota. It is composed of 
2 separate versions of a Chrome Extension, along with a Node.js server to process requests. The extensions remove Wikipedia content from
Google, particularly in the form of assets like the Knowledge box. It then logs this information on the server to analyze how much of an impact
Wikipedia has on the Google search experience.

The two version of the Chrome extension correspond to different experiment conditions. The normal extension, found in the extension folder, 
assigns the user an experiment condition randomly every session. The temporal extension has the user in the control condition for 1 week before moving
them to a new condition, to measure long term affects of the experiment condition. 
