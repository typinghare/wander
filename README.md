# [Wander](https://github.com/typinghare/wander)

This script addresses conflicts related to IDE settings folders. When collaborating on a project, team members often use the same IDE (e.g., VSCode, PyCharm, IntelliJ IDEA) but have different configurations. To avoid conflicts, we typically add the IDE settings directories (such as `.vscode` or `.idea`) to `.gitignore`. However, switching devices can result in losing these settings.

To resolve this issue, Wander provides a solution by allowing you to save your IDE settings in a dedicated directory within `.wander/<git-email>`. This directory, known as the user directory, stores each developer's IDE settings separately based on their Git email. When switching devices, you can easily restore your IDE settings from your user directory, ensuring a seamless transition.

## Install

Ensure that you have installed Node.js and npm, then run the following command:

```shell
sudo npm install -g @typinghare/wander
```

Check if Wander is installed successfully:

```shell
wander --version
```

## Usage

> Before using wander, make sure you have set up the Git email, and added `/.idea` (or `/.vscode`, and so on) to ignore and only ignore the IDE settings directory located in the root directory.  
> If you added `.idea` (or `.vscode`, and so on), you will ignore all the IDE settings directories, including the ones located in Wander storage.

```shell
# Display users and saved files/directories 
wander list

# Save the target file/directory to Wander storage
wander save <target>

# Restore the target file/directory from Wander storage
wander restore <target>

# Example
wander save .idea
wander restore .idea
```
