#!/bin/bash

# Increment the version number in Package.json
og=$(cat package.json | grep "version")
version=$(echo $og | sed -E "s/(\"version\": \"0.0.)(.+)(\",)/\2/g")
inc=$(($version + 1))
new_version=$(cat package.json | grep "version" | sed -E "s/(\"version\": \"0.0.)(.+)(\",)/\1$inc\3/g")
sed -i -e "s/$og/$new_version/g" package.json

# Publish to VSC Market
vsce package
vsce publish
