#!/bin/bash

mkdir buildimg
tar cfvz buildimg/dist.tar.gz dist
cp default.conf buildimg/
#eval "cat <<EOF
#$(< Dockerfile_tpl)
#EOF" > buildimg/Dockerfile
envsubst < Dockerfile_tpl > buildimg/Dockerfile
chown 1000:1000 -R buildimg
