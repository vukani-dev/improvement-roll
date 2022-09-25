# Contributing

When contributing to this repository, if it is a major code change, please first discuss the change you wish to make via issue,
email, or any other method, with the owners of this repository before making a change. 


## Pull Request Process

1. Fork this repo
2. Make changes
3. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
4. Update the README.md with details of changes to the interface, this includes new global variables or useful file locations.
5. Submit the pull request and await approval! 


## Setting up for Development

### Linux

- Follow react-native instructions for setting up the environment
  - Essentially, you need the following and any relevant tools added to your path:
    - Java version 8+ (I use 8 from openjdk)
    - Node/npm (I use nvm to install a specific LTS version, which is 14.17.4)
    - yarn (I'm using version 1.22.11)
    - Android SDK Manager (You can install via android-studio or command-line tool)
      - Android SDK Platform 29
      - Intel x86 Atom_64 System Image
      - Android SDK Tools 29.0.2
    - An android VM or device connected to pc

- `yarn` to install packages
- `yarn start` to start React Native server
- open another terminal
- `yarn run android` start the app