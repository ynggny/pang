# FROM gcr.io/distroless/cc-debian12:latest AS cc
FROM node:22-alpine

ENV LD_LIBRARY_PATH="/usr/local/lib"
# COPY --from=cc --chown=root:root --chmod=755 /lib/*-linux-gnu/* /usr/local/lib/
# RUN mkdir /lib64 && ln -s /usr/local/lib/ld-linux-*.so.2 /lib64/

ENV APP /app

WORKDIR $APP

RUN apk add --no-cache \
    git \
    tig
# sgerrandの公開鍵をダウンロードして追加
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub

# glibcのapkパッケージをダウンロード
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.34-r0/glibc-2.34-r0.apk

# glibcをインストール
RUN apk add --force-overwrite glibc-2.34-r0.apk

# パッケージのクリーンアップ（オプション）
RUN rm glibc-2.34-r0.apk

RUN npm install -g wrangler
