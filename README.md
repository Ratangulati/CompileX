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

- **Realtime Collaboration:** Users can collaborate in real-time, making it easy to work together on

- **Code Compilation:** Compile your code with judgeO and get the result in realtime.

- **Stylish UI with Tailwind CSS:** Utilizing the power of Tailwind CSS to create a visually appealing and customizable user interface.

- **Code Editor:** Using CodeMirror to write your code and get the syntax highlighting and debugging features.

- **Code Sharing:** Share your code with your friends and collaborate on the same code.

- **Code Snippets:** Use code snippets to quickly insert common code patterns.


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

5. Start the development server:
    ```bash
    npm run start
    ```
    The app should now be running at [http://localhost:3000](http://localhost:3000).

6. Example .env You can use in your localhost
```
VITE_BACKEND_URL=http://localhost:3000
```

## How to Contribute

- Make sure you have [Node.js](https://nodejs.org/) installed.
- Make sure you have [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.
- Make sure you have [Docker](https://docs.docker.com/engine/install/) installed.


### Setup guidelines 🪜

Follow these steps to setup CompileX on your local machine

1. [Fork](https://github.com/Ratangulati/CompileX.git) the project
2. Clone the project to run on your local machine using the following command:

   ```sh
   git clone https://github.com/<your_github_username>/CompileX.git
   ```

3. Get into the root directory

   ```sh
   cd CompileX
   ```

4. Install all dependencies by running

   ```sh
   npm install
   ```

5. Create your branch

   ```sh
   git checkout -b <your_branch_name>
   ```

6. Run and view the application on localhost

   ```sh
    npm start
   ```

> **P.S**: If you have `docker` installed in your system, you can follow these steps to set up the environment:
>
> 1. After forking and cloning the repo(as mentioned above), get into the project directory:
>
> ```bash
> cd CompileX/
> ```
>
> 2. Start the docker container with:
>
> ```bash
> docker-compose up
> ```
>
> 3. Now start adding your changes.
>    **Note:** You don't need to restart the container again and again after starting it once, because the changes you make will reflect in the container instantly.

7. Make your changes before staging them.

8. Stage your changes

   ```sh
   git add <filename>
   ```

9. Commit your changes

   ```sh
   git commit -m "<your-commit-message>"
   ```

10. Push your changes to your branch

    ```sh
    git push origin "<your_branch_name>"
    ```

11. Create a [PULL REQUEST](https://github.com/Ratangulati/CompileX/compare) 💣

    > Click _compare across forks_ if you don't see your branch

---

### Alternatively contribute using GitHub Desktop

1. **Open GitHub Desktop:**
   Launch GitHub Desktop and log in to your GitHub account if you haven't already.

2. **Clone the Repository:**
   - If you haven't cloned the CompileX repository yet, you can do so by clicking on the "File" menu and selecting "Clone Repository."
   - Choose the CompileX repository from the list of repositories on GitHub and clone it to your local machine.

3. **Switch to the Correct Branch:**
   - Ensure you are on the branch that you want to submit a pull request for.
   - If you need to switch branches, you can do so by clicking on the "Current Branch" dropdown menu and selecting the desired branch.

4. **Make Changes:**
   Make your changes to the code or files in the repository using your preferred code editor.

5. **Commit Changes:**
   - In GitHub Desktop, you'll see a list of the files you've changed. Check the box next to each file you want to include in the commit.
   - Enter a summary and description for your changes in the "Summary" and "Description" fields, respectively. Click the "Commit to <branch-name>" button to commit your changes to the local branch.

6. **Push Changes to GitHub:**
   After committing your changes, click the "Push origin" button in the top right corner of GitHub Desktop to push your changes to your forked repository on GitHub.

7. **Create a Pull Request:**
  - Go to the GitHub website and navigate to your fork of the CompileX repository.
  - You should see a button to "Compare & pull request" between your fork and the original repository. Click on it.

8. **Review and Submit:**
   - On the pull request page, review your changes and add any additional information, such as a title and description, that you want to include with your pull request.
   - Once you're satisfied, click the "Create pull request" button to submit your pull request.

9. **Wait for Review:**
    Your pull request will now be available for review by the project maintainers. They may provide feedback or ask for changes before merging your pull request into the main branch of the CompileX repository.