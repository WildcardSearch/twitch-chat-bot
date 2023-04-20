This document is meant to provide a prioritized list of tasks I wish to complete, in order to improve and, ultimately release a stable version of this project.

✅ 0.1.0 — Removes dependency upon `request` (`node-streamelements` replaced with custom drop-in.)

# 0.2.0 — Error System

Current system is for internal errors without possibility of extension.

- create a new module to handle processing errors and error codes
- have current internal error code data reformatted
- process internal error code data
- provide access for modules to register error categories and codes
- set up for easy production of docs

# 0.3.0 — Currency Update

- Add StreamLabs currency support
- Add internal, custom currency support

# Other (To Be Scheduled)

Before 1.0, I'd like to see many other features and changes to this project. Usually, that means that new tasks will be added to this list; some might be abandoned; others will get put off, while others may be prioritized more highly. Like the project, itself, this document is a work in progress.

## Internationalization
- add language system to allow translations

## `tmi.js`
- disentangle `tmi.js` from the core
- create public facing interface and allow continued support for `tmi.js` while allowing for other implentations, including a possible custom build

## Await Feedback

You may provide casual feedback by replying to release discussions. If you would like to suggest improvements, please follow the guidance in [CONTRIBUTING.md](https://github.com/WildcardSearch/twitch-chat-bot/blob/main/CONTRIBUTING.md).