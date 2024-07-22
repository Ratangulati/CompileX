# CompileX

![image](https://github.com/Ratangulati/CompileX/assets/116749593/04be600f-e9fa-4566-9781-866ff1560341)

![image](https://github.com/Ratangulati/CompileX/assets/116749593/2beea6c6-f398-47e5-b0f6-4ff8031ed53d)

## CompileX is a realtime collaborative code editor/compiler which helps users to connect, share, code & debug together in a seamless and engaging way.


## Table of Contents
* [Technologies Used](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#technologies-used)
* [Features](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#features)
* [Getting Started](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#getting-started)
    * [Pre-requisites](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#prerequisites)
    * [Installation](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#installation)
* [How to Contribute?](https://github.com/Ratangulati/CompileX?tab=readme-ov-file#how-to-contribute)


## Technologies Used

- **Frontend:**
    - React
    - Javascript
    - Tailwind CSS

- **Backend:** 
    - Node.js
    - Express.js
    - Socket.io

- **Editor & Code Compilation:** 
    - CodeMirror
    - judgeO



## Features
- **Responsive Design:** A responsive and mobile & web friendly UI to provide a consistent experience across devices.

- **Realtime Collaboration:** Users can collaborate in real-time, making it easy to work together.

- **Code Compilation:** Compile your code with judgeO and get the result in realtime.

- **Code Sharing:** Share your code with your friends and collaborate on the same code.

- **Code Editor:** Using CodeMirror to write your code and get the syntax highlighting and debugging features.

- **Stylish UI with Tailwind CSS:** Utilizing the power of Tailwind CSS to create a visually appealing and customizable user interface.


## Getting Started
### Prerequisites

- Node.js and npm installed on your machine.

### Installation

#### With Docker

1. Clone the repository:
    ```bash
    git clone https://github.com/Ratangulati/CompileX
    ``` 

2. Navigate to the project directory:
    ```bash
    cd CompileX
    ```
   
3. Run Docker Compose:
    ```bash
    docker-compose up
    ```
    The app should now be running at [http://localhost:3000](http://localhost:3000).

### Without Docker

1. Clone the repository:
    ```bash
    git clone https://github.com/Ratangulati/CompileX
    ``` 

2. Navigate to the project directory:
    ```bash
    cd CompileX
    ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
    ```bash
    npm start
    ```
    The app should now be running at [http://localhost:3000](http://localhost:3000).

6. Example .env You can use in your localhost
```
VITE_BACKEND_URL=http://localhost:3000
```

## How to Contribute 

To know how to contribute to the project visit [CONTRIBUTING.md](CONTRIBUTING.md).
