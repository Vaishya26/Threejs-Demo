# Threejs-Demo


<!-- ABOUT THE PROJECT -->
## About The Project

This Repository contains POC of 3D Scene and ability to upload and load 3D Models (GLTF/GLB). You can interact with 3D Objects like (Translate, Rotate, Scale, Delete). Load Multiple objects together inside a 3D Scene. 
Ability to Move around the 3D Scene with the help of Arrow Keys. Ability to Drag and Rotate Scene with Mouse Click and Mouse Move. Ability to Upload and store 3D Objects on Cloud Server.

## Built With

Key Frameworks used:
* [Node.JS]
* [Javascript]
* [HTML]
* [CSS]
* [Bootstrap]
* [Three.js]
* [Firebase]



<!-- GETTING STARTED -->
## Getting Started

Since this project is hosted on firebase and uses firebase's Storage, Hosting services,
Having Firebase command line tools becomes an base tool for entering into development.

### Prerequisites

* Node.js
* Firebase Command Line tool
npm
  ```sh
  npm install -g firebase-tools
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Vaishya26/Threejs-Demo.git
   ```
2. Change Directiory to /functions to land on main project.
   ```sh
   cd functions
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create Firebase Project from Firebase.com and Upload upload serviceAccount.json and Config Files inside /functions folder.

5. Log into Firebase Project  using Google Sign-in after following command
   ```sh
   firebase login
   ```

<!-- USAGE EXAMPLES -->
## Usage (From Command Line)

1. To start Local Development and Testing server
   ```sh
   firebase serve
   ```
2. To deploy current branch on main server
   ```sh
   firebase deploy -m "Deployment Tag"
   ```

## Usage (From Deployed URL)

1. Go to URL(https://arpitdemo26.web.app/scene)
   ```sh
   Use Pre Uploaded Models by clicking on Add button from Library.
   After Model gets loaded inside the scene, Click anywhere on the Model and use Translate, Rotate, Scale, Delete button to interact with the Model.
   Try to Load multiple Models Simultaneously.
   Try to Upload Models (GLTF/GLB) Files by clicking on Upload Button.
   ```
2. To Move around and Interact with the scene.
   ```sh
   Use Arrow Keys to move around the 3D Scene.
   Clicking mouse down with mouse Left Key and dragging the mouse helps to turn around from single point.
   ```
3. Demo Video for understanding usage.
   ![](functions/public/videos/demoScene.gif)




