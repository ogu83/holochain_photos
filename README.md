# Holochain Photos

A web application that can upload, preview and share photos in holochain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Nix-shell and Holochain is needed. Please follow steps from here https://developer.holochain.org/docs/install/

```
curl https://nixos.org/nix/install | sh
. ~/.nix-profile/etc/profile.d/nix.sh
nix-shell --version
```

You should see something like:
```
nix-shell (Nix) 2.3.1
```

Run Holochain

```
nix-shell https://holochain.love
```

### Installing

Clone Holochain Photos in some directory.

```
mkdir holochain_photos
cd holochain_photos
git clone https://github.com/ogu83/holochain_photos.git
```

Run it
```
hc package
hc run
```

Browse this url : http://127.0.0.1:8888/

Enjoy.


## Contributing


## Versioning

## Authors

* **Oguz Koroglu** - *Software Engineer* - [ogu83](https://github.com/ogu83)

See also the list of [contributors](https://github.com/ogu83/holochain_photos/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

