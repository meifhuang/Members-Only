# Members-Only
Odin Project - Members Only is an exclusive clubhouse where members can write and see anonymous messages while non-members can only see the message but not know who posted it. Non-members can enter a secret code to become a member.

Created with Node, Express, MongoDB

<a href="https://members-only-nsuw.onrender.com/"> See live demo </a>

## Getting started
For users to run the application locally. 

### Prerequisites
* Have Node.js and its package manager installed (npm)  
* Have a MongoDB server link in the local .env file. Ex) mongo = "insertlinkhere"
* Create a secret key in the local .env file. Ex) secrey_key = "insertyoursecrethere" 

### Installation
To install all dependencies:
```sh
npm install
```

To start the server:
```sh
node index.js
```

Open the browser and go to http://localhost:3000/
  

## Usage 
Without logging in, users can still view messages on the message board. However, the messages will show up as anonymous and users are unable to create a message. 

<img width="873" alt="memonly" src="https://github.com/meifhuang/Members-Only/assets/100555326/3cdcb083-a7c7-4cb1-b22d-efd46a53c0bb">

<h2> Sign up for an account and then log in to become a member! </h2> 

Once logged in, click + New Message to add a message to the message board. 

<img width="875" alt="msg" src="https://github.com/meifhuang/Members-Only/assets/100555326/32a16678-db15-48a3-bc0f-eb6640e3d287">

Clicking create message will redirect user to the message board and the message will be displayed. 

<img width="848" alt="memonlyyy" src="https://github.com/meifhuang/Members-Only/assets/100555326/6f7601a8-0aec-4533-ad07-820ccec51346">

Notice how users still cannot see who wrote the message unless they become a member. 
Click account on the upper right corner and click join club to become a member. Look closely for a hint. Good luck! 
