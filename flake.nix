{
  description = "Improvement Roll - A React Native Task Randomizer";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-node14 = {
      url = "github:NixOS/nixpkgs/nixos-21.11";
      flake = false;
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, nixpkgs-node14 }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        pkgs-node14 = import nixpkgs-node14 { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            pkgs-node14.nodejs-14_x
            yarn

            jdk8 
            gradle

            watchman
            
            gnumake
            gcc
            pkg-config
            fdroidserver
          ];

          shellHook = ''
            # Point to the project-local Android SDK using the current working directory
            export ANDROID_HOME="$PWD/.android-sdk"
            export ANDROID_SDK_ROOT="$ANDROID_HOME"
            # Add platform-tools and emulator to PATH if they exist (user needs to install them)
            export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
            
            # Increase inotify watches as specified in the project
            if [ -w /proc/sys/fs/inotify/max_user_watches ]; then
              echo 524288 > /proc/sys/fs/inotify/max_user_watches
            fi
          '';
        };
      }
    );
}
