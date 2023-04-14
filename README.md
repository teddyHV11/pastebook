# Pastebook
A simple and configurable site to store your frequently copied and pasted stuff into neatly organised categories.

It has the following features:
* 👤 A simple registration system that does not collect any user data. Just gives the user a pastebook ID to manage their pastes.
* 📚 A simple way to organise your pastes into categories, so that they can be easier to find.
* 🌱 Shortcuts to make using the pastebook easier.
# Self-hosting
[![Run on Replit](https://binbashbanana.github.io/deploy-buttons/buttons/remade/replit.svg)](https://replit.com/github/teddyHV11/pastebook)
[![Remix on Glitch](https://binbashbanana.github.io/deploy-buttons/buttons/remade/glitch.svg)](https://glitch.com/edit/#!/import/github/teddyHV11/pastebook)
[![Deploy to Cyclic](https://binbashbanana.github.io/deploy-buttons/buttons/remade/cyclic.svg)](https://app.cyclic.sh/api/app/deploy/teddyHV11/pastebook)
\
In order to self host follow these steps:
```bash
git clone https://github.com/teddyHV11/pastebook.git
cd pastebook
nano .env
npm i
npm start
```
Within .env you should add the following values.
```env 
allow_register=true
idsize=26
maxaccounts=2
uses3=true
```
``allow_register`` defines wether the site should allow people to make new pastebooks/register.\
``idsize`` defines how large an ID of a pastebook should be.\
``maxaccounts`` defines how much accounts can be made from an IP per hour.\
``uses3`` defines if S3FS will be used for S3 connection to storage. (supports Cyclic at this moment only)
