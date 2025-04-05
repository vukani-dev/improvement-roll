{
  description = "Improvement Roll";

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
          config.android_sdk.accept_license = true;
        };
        pkgs-node14 = import nixpkgs-node14 { inherit system; };
        androidComposition = pkgs.androidenv.composeAndroidPackages {
          platformVersions = [ "31"  ];
          buildToolsVersions = [ "30.0.3" "31.0.0" ];
          includeNDK = true;
          ndkVersions = [ "21.4.7075529" ];
          };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            pkgs-node14.nodejs-14_x
            pkgs.yarn

            jdk17
            gradle

            watchman
            
            gnumake
            gcc
            pkg-config
            fdroidserver
            androidComposition.androidsdk
            
          ];

          shellHook = ''
            # ANDROID_SDK_ROOT is deprecated but set for compatibility
            export ANDROID_SDK_ROOT="${androidComposition.androidsdk}/libexec/android-sdk"
            # Correct ANDROID_HOME path
            export ANDROID_HOME="${androidComposition.androidsdk}/libexec/android-sdk"
            # Set NDK path
            export ANDROID_NDK_ROOT="$ANDROID_HOME/ndk-bundle"
            export PATH="$ANDROID_NDK_ROOT:$PATH"
            export JAVA_HOME="${pkgs.jdk17}"
            # Point Gradle to the correct aapt2 binary
            export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=$ANDROID_HOME/build-tools/31.0.0/aapt2"
          '';

        };
      }
    );
}
