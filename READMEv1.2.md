<img src="pictures/featureGraphic.png" alt="banner">
---
A randomly selected todo list

[<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
     alt="Get it on F-Droid"
     height="80">](https://f-droid.org/packages/com.improvement_roll/)

<img src="https://img.shields.io/f-droid/v/com.improvement_roll.svg" width="200">

## What??
Inspired from "rolling" threads on 4chan. You can create category of tasks that you want to do (in no particular order).
Then press the button and it will randomly give you a task to do from said list.

You can also sort tasks in a category by how long it would take to complete them and randomly select based on time.

There is already a pre-generated category available called **General**

### Simple Example:
Say you want to get in shape but are too lazy to commit to a program.
You can create a Category called **Fitness**.
And in the **Fitness** category you can add tasks like:
- Do 50 pushups
- Squat for 5 minutes
- Do 40 Jumping Jacks
- *etc*

Then whenever you have free time you can open the app and select the **Fitness** category and a random one of these tasks will be given to you.
Now its up to you to do them but at least you didnt have to think about what to do :wink:

### Timed Example:
I bet you're thinking:
*What if the random task I've been given takes too much time to complete!* :worried:

Whether you are or aren't I built this feature anyways!

Lets say you are in the same situation as the simple example.
You can create the same Category called **Fitness**
During the category creation toggle the "This category is split by time" box.
Now you can enter in tasks and select how much time it takes for you to complete them.

Once you select the **Fitness** category to roll this time you will be asked how much time you have. And you will only be given tasks that are within that time range (If I only have 5 minutes id rather do pushups, But if I have an hour I can go for a run)

## Import/Export

### Importing

If creating Categories on the app is too cumbersome, you can create Categories via text editor and import them into the app.
This feature is located in the options page.

Available formats:

- **JSON**
- **TOML**
- **YAML**

However only with **JSON** and **YAML** can you import multiple Categories from one file.
Examples can be found under [categories/examples](https://github.com/vukani-dev/improvement-roll/tree/main/categories/examples)
The `time` variable under tasks is associated with the time it takes to usually complete it. This is only necessary for Categories that are timeSensitive (denoted by `timeSensitive` bool under the Category).

- 1 = 0 - 10 minutes
- 2 = 10 - 20 minutes
- 3 = 30 minutes - 1 hour
- 4 = 1+ hours

### Exporting

Categories in the app can also be exported into any of the supported formats. They will automatically be exported to your Downloads folder. Once again, the *Export All* feature is only available if you are exporting to **JSON**.

Both of these features require the app to need permission to read/save files on your phone. If you are not using this feature the permissions are not needed.

## Development

### Linux

- Follow react-native instructions for setting up the environment
  - Essentially you need the following and any relevant tools added to your path:
    - Java version 8 (I use 8 from openjdk)
    - Node/npm (I use nvm to install lts version which is 14.17.4)
    - yarn (Im using version 1.22.11)
    - Android SDK Manager (You can install via android-studio or command-line tool)
      - Android SDK Platform 29
      - Intel x86 Atom_64 System Image
      - Android SDK Tools 29.0.2
    - An android VM or device connected to pc

- `yarn` to install packages
- `yarn start` to start react native server
- `yarn run android` start the app

## Screenshots

<p>
<img src="pictures/home.png" alt="home" width="250">
<img src="pictures/category.png" alt="category" width="250">
<img src="pictures/roll.png" alt="roll" width="250">
</p>


## What are these "rolling" threads
On 4chan every post give you a corresponding ID. The ID generated from a post is what people would refer to as "rolling".

*For example:*
You could create a thread that says the last Number of your ID will determine how many pushups you do in that instance. People would then post as a reply to that thread to find out how many pushups they would do.
