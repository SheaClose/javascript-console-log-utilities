#!/bin/bash

# Increment the version number in Package.json
og=$(cat package.json | grep "version")
version=$(echo $og | sed -E "s/(\"version\": \"0.0.)(.+)(\",)/\2/g")
inc=$(($version + 1))
new_version=$(cat package.json | grep "version" | sed -E "s/(\"version\": \"0.0.)(.+)(\",)/\1$inc\3/g")
sed -i -e "s/$og/$new_version/g" package.json

rm javascript-console-log-utilities*
rm convert-input-to-get-set*

# Publish to VSC Market
vsce package

# If this fails, got to https://dev.azure.com/sheaclose/_usersSettings/tokens 
# Login with hotmail account.
# Renew token for javascript-console-log-utilities-v2
# In the console enter `vsce login sheaclose` and update the PAT with the newly generated token.
vsce publish 

git commit -am "publishing to version: $version to vscode marketplace"
git push origin $(git branch | grep \* | cut -d ' ' -f2)
